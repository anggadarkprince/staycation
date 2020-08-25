const Log = require('../models/Log');
const createError = require('http-errors');

module.exports = {
    index: async (req, res) => {
        const logs = await Log.find({userId: req.user._id}).populate('userId');
        res.render('activity-log/index', {title: 'Activity Log', logs});
    },
    view: async (req, res, next) => {
        const id = req.params.id;
        try {
            const log = await Log.findById(id).populate('userId');
            if (log.data && typeof log.userAgent === 'object') {
               if(log.data.password) delete log.data.password;
               if(log.data.tokens) delete log.data.tokens;
               if(log.data._id) delete log.data._id;
               if(log.data.__v) delete log.data.__v;
            }
            res.render('activity-log/view', {title: `View log ${log.type}`, log});
        } catch (err) {
            next(createError(404))
        }
    },
};
