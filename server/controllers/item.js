const createError = require('http-errors');
const Item = require('../models/Item');
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
        }).populate('categoryId').sort([[sortBy, sortMethod]]);

        if (isExported) {
            return res
                .attachment('items.xlsx')
                .send(exporter.toExcel('Items', items, ['title', 'city', 'country', 'price', 'createdAt', 'updatedAt']));
        } else {
            res.render('admin/item/index', {title: 'Item', items});
        }
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const item = await Item.findOne({_id: id}).populate('categoryId').populate('imageId');
            res.render('admin/item/view', {title: `View item ${item.title}`, item});
        } catch (err) {
            next(createError(404))
        }
    },
    create: async (req, res) => {
        const categories = await Category.find();

        res.render('admin/item/create', {title: 'Create Item', categories});
    },
    save: async (req, res) => {
        const {title, category, price, country, city, is_popular: isPopular, description, input_photos: photos, is_primary_photo: primaryPhoto} = req.body;
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
                    await Item.create({
                        title, country, city, isPopular, description,
                        price: extractNumber(price),
                        categoryId: category,
                        imageId: photoId || []
                    });
                    req.flash('success', `Item ${title} successfully created`);
                    res.redirect('/admin/item');
                })
                .catch(console.log);

        } catch (err) {
            console.log(err);
            req.flash('old', req.body);
            req.flash('danger', `Save item ${title} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const item = await Item.findOne({_id: id}).populate('imageId');
        const categories = await Category.find();

        res.render('admin/item/edit', {title: `Edit item ${item.title}`, item, categories});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {title, category, price, country, city, is_popular: isPopular, description, input_photos: photos, is_primary_photo: primaryPhoto} = req.body;

        try {
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
                    const result = await Item.findOne({_id: id});
                    result.title = title;
                    result.price = extractNumber(price);
                    result.country = country;
                    result.city = city;
                    result.isPopular = isPopular;
                    result.description = description;
                    result.categoryId = category;
                    result.imageId = photoId;
                    result.save();

                    req.flash('success', `Item ${title} successfully updated`);
                    return res.redirect('/admin/item');
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
            return res.redirect('/admin/item');
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