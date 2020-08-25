const Setting = require('../models/Setting');

module.exports = {
    index: async (req, res) => {
        const systemSetting = {
            appName: (await Setting.findOne({key: 'app-name'})).value || process.env.APP_NAME,
            contact: (await Setting.findOne({key: 'contact'})).value || '',
            email: (await Setting.findOne({key: 'email'})).value || process.env.MAIL_ADMIN,
            address: (await Setting.findOne({key: 'address'})).value || '',
            currencySymbol: (await Setting.findOne({key: 'currency-symbol'})).value || '',
            taxPercent: (await Setting.findOne({key: 'tax-percent'})).value || 10,
            publicRegistration: (await Setting.findOne({key: 'public-registration'})).value || 0,
        };

        const userPreference = req.user.preferences || {};
        const userSetting = {
            notificationNewBooking: 'notificationNewBooking' in userPreference ? userPreference.notificationNewBooking : 1,
            notificationNewUser: 'notificationNewUser' in userPreference ? userPreference.notificationNewUser : 1,
            notificationInsight: 'notificationInsight' in userPreference ? userPreference.notificationInsight : 1,
        };
        res.render('setting/index', {title: 'Settings', systemSetting, userSetting});
    },
    update: async (req, res) => {
        const {notification_new_booking, notification_new_user, notification_insight} = req.body;
        const {app_name: appName, contact, email, address, currency, tax_percent: taxPercent, public_registration: publicRegistration} = req.body;

        try {
            const appNameData = await Setting.findOne({key: 'app-name'});
            appNameData.value = appName;
            appNameData.save();

            const contactData = await Setting.findOne({key: 'contact'});
            contactData.value = contact;
            contactData.save();

            const emailData = await Setting.findOne({key: 'email'});
            emailData.value = email;
            emailData.save();

            const addressData = await Setting.findOne({key: 'address'});
            addressData.value = address;
            addressData.save();

            const currencyData = await Setting.findOne({key: 'currency-symbol'});
            currencyData.value = currency;
            currencyData.save();

            const taxPercentData = await Setting.findOne({key: 'tax-percent'});
            taxPercentData.value = taxPercent;
            taxPercentData.save();

            const publicRegistrationData = await Setting.findOne({key: 'public-registration'});
            publicRegistrationData.value = publicRegistration || 0;
            publicRegistrationData.save();

            req.user.preferences = {
                notificationNewBooking: notification_new_booking || 0,
                notificationNewUser: notification_new_user || 0,
                notificationInsight: notification_insight || 0,
            };
            req.user.save();

            req.flash('success', `Setting successfully updated`);
            return res.redirect('/settings');
        }
        catch (err) {
            console.log(err);
            req.flash('old', req.body);
            req.flash('danger', `Update setting failed, try again later`);
            res.redirect('back');
        }
    },

};
