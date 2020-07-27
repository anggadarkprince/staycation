const multer = require("multer");
const path = require("path");
const fs = require("fs");
// import uuid from "uuid/v4";

const storageMultiple = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = 'public/uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadMultiple = multer({
    storage: storageMultiple,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).array("image", 12);


// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const year = (new Date()).getFullYear().toString();
        const month = ((new Date()).getMonth() + 1).toString();
        //const dir = path.join(__dirname, '..', 'public', 'uploads', year, month);
        const dir = `uploads/${year}/${month}`;
        fs.mkdir(dir, {recursive: true}, err => callback(err, dir));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

const uploadTemp = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            const dir = 'uploads/temp';
            fs.mkdir(dir, {recursive: true}, err => callback(err, dir));
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// // Check file Type
function checkFileType(file, cb) {

    // Allowed ext
    const fileTypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: Images Only !!!");
    }
}

module.exports = { uploadMultiple, upload, uploadTemp };