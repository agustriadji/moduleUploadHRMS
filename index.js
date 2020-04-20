/**
 * @format
 */

const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// eslint-disable-next-line import/no-unresolved
const uploadConfig = require('../../../config/upload');

const { fileTmp } = uploadConfig;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fileTmp);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

function fileFilter(req, file, cb) {
    const msg = {
        header: {
            message: 'Error',
            status: 500,
            access: null,
        },
        data: null,
    };

    if (file) {
        // only running with content-type multipart/form
        const splitFilename = file.originalname.split(' ');
        const joinFilename = splitFilename.join('_');
        const splitExt = joinFilename.split('.');
        const ext = splitExt[1];
        const checkExt = uploadConfig.fileExt.indexOf(ext.toLowerCase());

        if (splitExt.length > 2) {
            msg.header.message = uploadConfig.message.error.filename;
            return cb(msg);
        }
        if (checkExt < 0) {
            msg.header.message = uploadConfig.message.error.supportExt;
            return cb(msg);
        }
        if (file.size > uploadConfig.fileSize) {
            msg.header.message = uploadConfig.message.error.size;
            return cb(msg);
        }

        // eslint-disable-next-line no-param-reassign
        file.data = {
            filename: `${splitExt[0]}_${Date.now()}.${ext}`,
            path: uploadConfig.filePath,
        };
        // eslint-disable-next-line no-param-reassign
        file.originalname = file.data.filename;

        return cb(null, true);
    }
    // request not multipart
    return cb(null, false);
}

const uploads = multer({
    fileFilter,
    storage,
    limits: uploadConfig.limits,
});
const actionUpload = ['replace', 'save'];

module.exports = {
    files_upload: uploads,
    multer_err: multer.MulterError,
    sendToFileManager: (data, cb) => {
        const bodyFormData = new FormData();
        if (actionUpload.indexOf(data.action) !== -1) {
            bodyFormData.append(
                'filebuffer',
                fs.createReadStream(`${fileTmp}/${data.filename}`),
            );
        }

        bodyFormData.append('filepath', `${data.path}${data.filename}`);
        bodyFormData.append('action', data.action);

        axios
            .create({
                headers: bodyFormData.getHeaders(),
            })
            .post(uploadConfig.urlStore, bodyFormData)
            .then((response) => {
                if (response.data.header.status === 200) {
                    fs.unlinkSync(`${fileTmp}/${data.filename}`);
                    return cb(null, data);
                }
                return cb(true, 'Upload Failed');
            })
            .catch((error) => {
                return cb(true, error);
            });
    },
    getFileManager: (data, cb) => {
        axios
            .get(`${uploadConfig.urlStore}?filepath=${data.path}`)
            .then((response) => {
                if (response.data.header.status === 200) {
                    return cb(null, response.data);
                }
                return cb(true, 'Get file failed');
            })
            .catch((error) => {
                return cb(true, error);
            });
    },
};
