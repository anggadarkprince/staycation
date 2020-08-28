const createError = require('http-errors');
const Item = require('../models/Item');
const Facility = require('../models/Facility');
const Category = require('../models/Category');
const Image = require('../models/Image');
const exporter = require('../modules/Exporter');
const {extractNumber} = require('../helpers/formatter');
const moment = require('moment');
const path = require("path");
const fs = require("fs");

module.exports = {
    index: async (req, res) => {
        const sortBy = req.query.sort_by || 'createdAt';
        const sortMethod = Number(req.query.order_method) || -1;
        const search = req.query.search;
        const category = req.query.category;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const isExported = req.query.export;

        const items = await Item.find({
            ...((dateFrom || dateTo) && {
                createdAt: {
                    ...(dateFrom && {$gte: new Date(dateFrom)}),
                    ...(dateTo && {$lte: moment(dateTo).endOf('day').toDate()}),
                }
            }),
            ...(search && {
                $and: [{
                    $or: [
                        {title: {$regex: `.*${search}.*`, $options: 'i'}},
                        {city: {$regex: `.*${search}.*`, $options: 'i'}},
                        {country: {$regex: `.*${search}.*`, $options: 'i'}},
                    ]
                }]
            }),
            ...(category && {
                categoryId: category
            }),
        }).populate('categoryId').sort([[sortBy, sortMethod]]);

        if (isExported) {
            return res
                .attachment('items.xlsx')
                .send(exporter.toExcel('Items', items, ['title', 'city', 'country', 'price', 'createdAt', 'updatedAt']));
        } else {
            const categories = await Category.find();
            res.render('item/index', {title: 'Item', items, categories});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const item = await Item.findOne({_id: id}).populate([
                {
                    model: 'Image',
                    path: 'imageId',
                    select: 'isPrimary imageUrl fileName'
                },
                {
                    model: 'Facility',
                    path: 'facilities._id',
                    select: 'facility image description'
                },
                {
                    model: 'Category',
                    path: 'categoryId',
                    select: 'category description'
                }
            ]);
            res.render('item/view', {title: `View item ${item.title}`, item});
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const categories = await Category.find();
        const facilities = await Facility.find();

        res.render('item/create', {title: 'Create Item', categories, facilities});
    },
    save: async (req, res) => {
        const {
            title, category: categoryId, price, country, city, description, facilities, activities,
            is_popular: isPopular, input_photos: photos, is_primary_photo: primaryPhoto
        } = req.body;
        try {
            const photoId = (photos || []).map(async photo => {
                const year = (new Date()).getFullYear().toString();
                const month = ((new Date()).getMonth() + 1).toString();
                const oldPath = `uploads/temp/${photo}`;
                const dir = `uploads/${year}/${month}`;
                const newPath = `${dir}/${photo}`;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                fs.copyFileSync(oldPath, newPath);
                const image = await Image.create({
                    imageUrl: path.join('/', newPath),
                    fileName: photo,
                    isPrimary: photo === primaryPhoto
                });
                return image._id;
            });
            Promise.all(photoId)
                .then(async photoId => {
                    let activityData = [];
                    if (activities) {
                        activityData = activities.map(activity => {
                            const year = (new Date()).getFullYear().toString();
                            const month = ((new Date()).getMonth() + 1).toString();
                            const oldPath = `uploads/temp/${activity.image}`;
                            const dir = `uploads/${year}/${month}`;
                            const newPath = `${dir}/${activity.image}`;
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }
                            fs.copyFileSync(oldPath, newPath);
                            const image = path.join('/', newPath);
                            return {...activity, image};
                        });
                    }
                    const item = await Item.create({
                        title, country, city, isPopular, description,
                        price: extractNumber(price),
                        categoryId: categoryId,
                        imageId: photoId || [],
                        facilities: Object.keys(facilities || []).map(key => ({_id: key, qty: facilities[key]})),
                        activities: activityData
                    });

                    const category = await Category.findById(categoryId);
                    category.itemId.push(item._id);
                    category.save();

                    Object.keys(facilities || []).forEach(key => {
                        Facility.findById(key)
                            .then(facility => {
                                facility.itemId.push(item._id);
                                facility.save();
                            });
                    });

                    req.flash('success', `Item ${title} successfully created`);
                    res.redirect('/item');
                })
                .catch(err => {
                    console.log(err);
                    req.flash('error', err);
                    req.flash('old', req.body);
                    req.flash('danger', `Save item ${title} failed, try again later`);
                    res.redirect('back');
                });

        } catch (err) {
            console.log(err);
            req.flash('error', err);
            req.flash('old', req.body);
            req.flash('danger', `Save item ${title} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const item = await Item.findOne({_id: id}).populate('imageId');
        const categories = await Category.find();
        const facilities = await Facility.find();

        res.render('item/edit', {title: `Edit item ${item.title}`, item, categories, facilities});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {
            title, category: categoryId, price, country, city, facilities, description, activities,
            is_popular: isPopular, input_photos: photos, is_primary_photo: primaryPhoto
        } = req.body;

        try {
            const item = await Item.findById(id);
            const photoId = (photos || []).map(async photo => {
                if (!photo._id) {
                    const year = (new Date()).getFullYear().toString();
                    const month = ((new Date()).getMonth() + 1).toString();
                    const oldPath = `uploads/temp/${photo}`;
                    const dir = `uploads/${year}/${month}`;
                    const newPath = `${dir}/${photo}`;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    fs.copyFileSync(oldPath, newPath);
                    const image = await Image.create({
                        imageUrl: path.join('/', newPath),
                        fileName: photo,
                        isPrimary: photo === primaryPhoto
                    });
                    return image._id;
                } else {
                    const existingImage = await Image.findOne({_id: photo._id});
                    existingImage.isPrimary = existingImage.fileName === primaryPhoto;
                    existingImage.save();
                    return photo._id;
                }
            });
            Promise.all(photoId)
                .then(async photoId => {
                    let activityData = [];
                    if (activities) {
                        activityData = activities.map(activity => {
                            if (!activity._id) {
                                const year = (new Date()).getFullYear().toString();
                                const month = ((new Date()).getMonth() + 1).toString();
                                const oldPath = `uploads/temp/${activity.image}`;
                                const dir = `uploads/${year}/${month}`;
                                const newPath = `${dir}/${activity.image}`;
                                if (!fs.existsSync(dir)) {
                                    fs.mkdirSync(dir);
                                }
                                fs.copyFileSync(oldPath, newPath);
                                const image = path.join('/', newPath);
                                return {...activity, image};
                            } else {
                                return activity;
                            }
                        });
                    }

                    const activityIds = (activities || []).filter(activity => activity._id || false).map(activity => activity._id);
                    item.activities.forEach(activity => {
                        if (!activityIds.includes(activity._id.toString())) {
                            fs.unlinkSync(activity.image.replace(/^(\\)/, ''));
                        }
                    });

                    const result = await Item.findOne({_id: id});
                    const oldCategoryId = result.categoryId;
                    const oldFacilities = result.facilities.map(oldFacility => oldFacility._id);

                    result.title = title;
                    result.price = extractNumber(price);
                    result.country = country;
                    result.city = city;
                    result.isPopular = isPopular;
                    result.description = description;
                    result.categoryId = categoryId;
                    result.imageId = photoId;
                    result.facilities = Object.keys(facilities || []).map(key => ({_id: key, qty: facilities[key]}));
                    result.activities = activityData;
                    await result.save();

                    const category = await Category.findById(categoryId);
                    if (!category.itemId.includes(id)) {
                        category.itemId.push(item._id);
                        await category.save();
                    }
                    if (oldCategoryId != categoryId) {
                        const oldCategory = await Category.findById(oldCategoryId);
                        oldCategory.itemId.pull(id);
                        await oldCategory.save();
                    }

                    const facilityIds = Object.keys(facilities || []);
                    facilityIds.forEach(key => {
                        Facility.findById(key)
                            .then(facility => {
                                if (!facility.itemId.includes(id)) {
                                    facility.itemId.push(item._id);
                                    facility.save();
                                }
                            });
                        oldFacilities.forEach(oldFacilityId => {
                            if (!facilityIds.includes(oldFacilityId.toString())) {
                                Facility.findById(oldFacilityId)
                                    .then(oldF => {
                                        oldF.itemId.pull(id);
                                        oldF.save();
                                    });
                            }
                        });
                    });

                    req.flash('success', `Item ${title} successfully updated`);
                    return res.redirect('/item');
                })
                .catch(console.log);
        }
        catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Update item ${title} failed, try again later`);
            res.redirect('back');
        }
    },
    delete: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Item.findOne({_id: id}).populate('imageId');
            result.remove();

            if (result.imageId) {
                result.imageId.forEach(image => {
                    fs.unlink(image.imageUrl.replace(/^(\\)/, ''), console.log);
                });
            }

            req.flash('warning', `Item ${result.title} successfully deleted`);
            return res.redirect('/item');
        }
        catch (err) {
            req.flash('danger', `Delete item failed, try again later`);
            res.redirect('back');
        }
    },
    deleteImage: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await Image.findOne({_id: id});
            result.remove();

            await fs.unlink(result.imageUrl.replace(/^(\\)/, ''), function (err) {
                if (!err) {
                    return res.json({status: 'success'});
                } else {
                    return res.json({
                        status: 'error',
                        error: 'File cannot deleted',
                    });
                }
            });
        }
        catch (err) {
            return res.json({
                status: 'error',
                error: err.message
            });
        }
    },
};
