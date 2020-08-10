const Item = require('../../models/Item');
const Category = require('../../models/Category');
const Bank = require('../../models/Bank');
const Member = require('../../models/Member');

module.exports = {
    index: async (req, res) => {
        try {
            const mostPicked = await Item.find()
                .select('_id title country city price imageId')
                .limit(5)
                .populate({path: 'imageId', select: '_id imageUrl'})

            const category = await Category.find()
                .select('_id category')
                .limit(3)
                .populate({
                    path: 'itemId',
                    select: '_id title country city isPopular  imageId',
                    perDocumentLimit: 4,
                    option: {sort: {sumBooking: -1}},
                    populate: {
                        path: 'imageId',
                        select: '_id imageUrl',
                        perDocumentLimit: 1
                    }
                })

            const traveler = await Member.find();
            const treasure = await Item.find();
            const city = await Item.find();

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial2.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Angga",
                familyOccupation: "Product Designer"
            }

            res.status(200).json({
                hero: {
                    travelers: traveler.length,
                    treasures: treasure.length,
                    cities: city.length
                },
                mostPicked,
                category,
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
                imageUrl: "images/testimonial1.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Angga",
                familyOccupation: "Product Designer"
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
