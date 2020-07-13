const nodemailer = require('nodemailer');

function sendMail(mailOptions, callback) {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });
    transporter.sendMail(mailOptions, callback);
}

module.exports = {
    sendMail
};