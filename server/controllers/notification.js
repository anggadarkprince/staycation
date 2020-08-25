const Notification = require('../models/Notification');

module.exports = {
    index: async (req, res) => {
        const notifications = await Notification.find({userId: req.user._id}).sort([['createdAt', -1]]).limit(50);
        res.render('notification/index', {title: 'Notification', notifications});
    },
    read: async (req, res) => {
        try {
            const id = req.params.id;
            const notification = await Notification.findById(id);
            notification.isRead = true;
            notification.save();

            return res.redirect(notification.url || '/notification');
        } catch (err) {
            res.redirect('/notification');
        }
    },
    readAll: async (req, res) => {
        try {
            await Notification.updateMany({userId: req.user._id, isRead: false}, {isRead: true});

            return res.redirect('/notification');
        } catch (err) {
            console.log(err);
            res.redirect('/notification');
        }
    },
};
