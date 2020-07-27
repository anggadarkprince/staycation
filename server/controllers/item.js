const createError = require('http-errors');
const Item = require('../models/Item');
const Image = require('../models/Image');
const exporter = require('../modules/Exporter');
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
        }).sort([[sortBy, sortMethod]]);

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
            const item = await Item.findOne({_id: id}).populate('imageId');
            console.log('aaa');
            console.log(item);
            res.render('admin/item/view', {title: `View item ${item.title}`, item});
        } catch (err) {
            next(createError(404))
        }
    },
    create: (req, res) => {
        res.render('admin/item/create', {title: 'Create Item'});
    },
    save: async (req, res) => {
        const {title, price, country, city, is_popular: isPopular, description, input_photos: photos, is_primary_photo: primaryPhoto} = req.body;
        try {
            const photoId = photos.map(async photo => {
                const year = (new Date()).getFullYear().toString();
                const month = ((new Date()).getMonth() + 1).toString();
                const oldPath = `uploads/temp/${photo}`;
                const newPath = `uploads/${year}/${month}/${photo}`;
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
                        title, price, country, city, isPopular, description,
                        imageId: photoId
                    });
                    req.flash('success', `Item ${title} successfully created`);
                    res.redirect('/admin/item');
                })
                .catch(console.log);

        } catch (err) {
            req.flash('old', req.body);
            req.flash('danger', `Save item ${title} failed, try again later`);
            res.redirect('back');
        }
    },
    edit: async (req, res) => {
        const id = req.params.id;
        const item = await Item.findOne({_id: id});

        res.render('admin/item/edit', {title: `Edit item ${item.title}`, item});
    },
    update: async (req, res) => {
        const id = req.params.id;
        const {title, price, country, city, is_popular: isPopular, description} = req.body;

        try {
            const result = await Item.findOne({_id: id});
            result.title = title;
            result.price = price;
            result.country = country;
            result.city = city;
            result.isPopular = isPopular;
            result.description = description;
            result.save();

            req.flash('success', `Item ${title} successfully updated`);
            return res.redirect('/admin/item');
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
            const result = await Item.findOne({_id: id});
            result.remove();

            req.flash('warning', `Item ${result.title} successfully deleted`);
            return res.redirect('/admin/item');
        }
        catch (err) {
            req.flash('danger', `Delete item failed, try again later`);
            res.redirect('back');
        }
    },
};