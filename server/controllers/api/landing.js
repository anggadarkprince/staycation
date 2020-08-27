const Item = require('../../models/Item');
const Category = require('../../models/Category');
const User = require('../../models/User');
const Bank = require('../../models/Bank');
const Facility = require('../../models/Facility');

module.exports = {
    index: async (req, res) => {
        try {
            const mostPickedData = await Item.find()
                .select('_id title country city price imageId')
                .limit(5)
                .populate({path: 'imageId', select: '_id imageUrl isPrimary'});
            const mostPicked = mostPickedData.map(item => {
                const mostPickedItem = {...item._doc};
                mostPickedItem.currencySymbol = req.settings.currencySymbol;
                mostPickedItem.imageUrl = res.locals._baseUrl + mostPickedItem.imageId.find(image => image.isPrimary === true).imageUrl.replace(/\\/g, "/");
                return mostPickedItem;
            });

            const categoryData = await Category.find()
                .select('_id category')
                .limit(3)
                .populate({
                    path: 'itemId',
                    select: '_id title country city isPopular imageId',
                    perDocumentLimit: 4,
                    option: {sort: {sumBooking: -1}},
                    populate: {
                        path: 'imageId',
                        select: '_id imageUrl isPrimary',
                        //perDocumentLimit: 1
                    }
                });
            const categories = categoryData.map(item => {
                const categoryItem = {...item._doc};
                categoryItem.itemId = categoryItem.itemId.map(itemId => {
                    const singleItem = {...itemId._doc};
                    singleItem.imageUrl = res.locals._baseUrl + singleItem.imageId.find(image => image.isPrimary === true).imageUrl.replace(/\\/g, "/");
                    return singleItem;
                });
                return categoryItem;
            });

            const traveler = await User.find();
            const treasure = await Item.find();
            const city = await Item.find();

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "http://localhost:3000/uploads/2020/8/1596522474815.jpg",
                title: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon...",
                name: "Angga Ari Wijaya",
                occupation: "Product Designer"
            }

            res.status(200).json({
                hero: {
                    travelers: traveler.length,
                    treasures: treasure.length,
                    cities: city.length
                },
                mostPicked,
                categories,
                testimonial
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },
    detail: async (req, res) => {
        try {
            const {id} = req.params;
            const item = await Item.findOne({_id: id})
                .populate({path: 'facilities._id', select: '_id facility image'})
                .populate({path: 'imageId', select: '_id imageUrl isPrimary'});
            item._doc.currencySymbol = req.settings.currencySymbol;

            item._doc.facilities = item._doc.facilities.map(facility => {
                return {
                    facility: facility._id.facility,
                    imageUrl: res.locals._baseUrl + facility._id.image.replace(/\\/g, "/"),
                    qty: facility.qty
                };
            });

            item._doc.imageId = item._doc.imageId.map(image => {
                return {
                    _id: image._id,
                    imageUrl: res.locals._baseUrl + image.imageUrl.replace(/\\/g, "/"),
                    isPrimary: image.isPrimary,
                };
            });

            const categoryData = await Category.find({_id: item.categoryId})
                .select('_id category')
                .populate({
                    path: 'itemId',
                    select: '_id title country city isPopular imageId',
                    perDocumentLimit: 4,
                    option: {sort: {sumBooking: -1}},
                    populate: {
                        path: 'imageId',
                        select: '_id imageUrl isPrimary',
                    }
                });
            const categories = categoryData.map(item => {
                const categoryItem = {...item._doc};
                categoryItem.itemId = categoryItem.itemId.map(itemId => {
                    const singleItem = {...itemId._doc};
                    singleItem.imageUrl = res.locals._baseUrl + singleItem.imageId.find(image => image.isPrimary === true).imageUrl.replace(/\\/g, "/");
                    return singleItem;
                });
                return categoryItem;
            });

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "http://localhost:3000/uploads/2020/8/1596522474815.jpg",
                title: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon...",
                name: "Angga Ari Wijaya",
                occupation: "Product Designer"
            }

            res.status(200).json({
                ...item._doc,
                categories,
                testimonial
            })

        } catch (error) {
            res.status(500).json({message: "Internal server error"});
        }
    },
    banks: async (req, res) => {
        try {
            const banks = await Bank.find();
            const bankData = banks.map(bank => {
                return {
                    _id: bank._id,
                    bank: bank.bank,
                    logo: res.locals._baseUrl + bank.logo.replace(/\\/g, "/"),
                    description: bank.description
                }
            });
            res.json(bankData);
        } catch (error) {
            res.status(500).json({message: "Internal server error"});
        }
    },
    facilities: async (req, res) => {
        try {
            const facilities = await Facility.find();
            const facilityData = facilities.map(facility => {
                return {
                    _id: facility._id,
                    facility: facility.facility,
                    image: res.locals._baseUrl + facility.image.replace(/\\/g, "/"),
                    description: facility.description
                }
            });
            res.json(facilityData);
        } catch (error) {
            res.status(500).json({message: "Internal server error"});
        }
    },
    categories: async (req, res) => {
        try {
            const categories = await Category.find();
            const categoryData = categories.map(category => {
                return {
                    _id: category._id,
                    category: category.category,
                    description: category.description
                }
            });
            res.json(categoryData);
        } catch (error) {
            res.status(500).json({message: "Internal server error"});
        }
    },
    explore: async (req, res) => {
        try {
            res.json([]);
        } catch (error) {
            res.status(500).json({message: "Internal server error"});
        }
    },
}
