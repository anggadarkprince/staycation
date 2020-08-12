const Item = require('../../models/Item');
const Category = require('../../models/Category');
const Bank = require('../../models/Bank');
const User = require('../../models/User');

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
                .populate({path: 'featureId._id', select: '_id feature image'})
                .populate({path: 'imageId', select: '_id imageUrl'});

            const bank = await Bank.find();

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
                bank,
                testimonial
            })

        } catch (error) {
            res.status(500).json({message: "Internal server error"});
        }
    },
}
