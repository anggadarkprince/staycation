const path = require("path");
const fs = require("fs");

module.exports = {
    uploadTemp: async (req, res) => {
        try {
            if(req.file) {
                return res.json({
                    status: 'success',
                    error: '',
                    data: {
                        originalName: req.file.originalname,
                        fileName: req.file.filename,
                        fileUrl: res.locals._baseUrl + '/' + req.file.path.replace(/\\/g, "/"),
                        path: path.join('/', req.file.path),
                    }
                });
            } else {
                return res.json({
                    status: 'error',
                    error: 'File not found',
                    data: {}
                });
            }
        } catch (err) {
            return res.json({
                status: 'error',
                error: err.message
            });
        }
    },
    deleteTemp: async (req, res) => {
        try {
            if(req.body.file) {
                await fs.unlink(path.join('uploads/temp/', req.body.file.replace(/^(\\)/, '')), console.log);
                return res.json({status: 'success'});
            } else {
                return res.json({
                    status: 'error',
                    error: 'File not found',
                });
            }
        } catch (err) {
            return res.json({
                status: 'error',
                error: err.message
            });
        }
    },
};