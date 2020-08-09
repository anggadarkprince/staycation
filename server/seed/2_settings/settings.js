const {getObjectId} = require('mongo-seeding');

module.exports = [
    {
        id: getObjectId('app-name'),
        key: 'app-name',
        value: process.env.APP_NAME,
        description: 'Public app name',
    },
    {
        id: getObjectId('contact'),
        key: 'contact',
        value: '',
        description: 'Company or support contact',
    },
    {
        id: getObjectId('email'),
        key: 'email',
        value: process.env.MAIL_ADMIN,
        description: 'Company or support email address',
    },
    {
        id: getObjectId('address'),
        key: 'address',
        value: '',
        description: 'Company office address',
    },
    {
        id: getObjectId('currency-symbol'),
        key: 'currency-symbol',
        value: 'IDR',
        description: 'Company office address',
    },
    {
        id: getObjectId('tax-percent'),
        key: 'tax-percent',
        value: 10,
        description: 'Default tax percent',
    },
    {
        id: getObjectId('public-registration'),
        key: 'public-registration',
        value: 1,
        description: 'Allow to public user to register',
    },
];