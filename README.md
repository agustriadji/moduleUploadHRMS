# NOTED

- `npm install @agustriadji/upload-files --save`
- setting file .env , config/upload.js dan app/middleware/upload.js

# Config File Uplaod

1.  .env
    
    FILE_MANAGER_URL dan FILE_MANAGER_PORT : atur url dan port untuk dihubungkan pada service file-manager pada server 12.

2.  .config/upload.js
    
    Disini mengatur filter file seperti :
    -   **urlStore**    : API Address untuk request upload.
    -   **urlGet**      : API Address untuk request view file / download file.
    -   **fileSize**    : Nilai Maksimum dari filesize yang diperbolehkan, satuan (byte).
    -   **filePath**    : Pengaturan path upload yang akan disimpan pada servis file-manager.
    -   **fileExt**     : Filter extension yang diperbolehkan.
    -   **limits**      : Pengaturan pembatasan request terkait attack ddos.
    -   **fileTmp**     : Pengaturan path temporary yang akan dipakai sementara.
    -   **error**       : Pengaturan pesan gagal untuk middleware upload.

# Setup Middleware Upload

-   Buat file upload.js pada dir *app/middleware/upload.js*

    const libUpload = require('@agustriadji/upload-files');
    module.exports = {
        files_upload: libUpload.files_upload,
        multer_err: libUpload.multer_err,
        sendToFileManager: libUpload.sendToFileManager,
        getFileManager: libUpload.getFileManager,
    };

-   Buat file app/middleware/index.js untuk daftarkan file upload.js
    
    module.exports = {
        upload: require('./upload'),
    };

# Setup Middleware Upload Pada RoutesAPI

const middle = require('../../middleware');
const middleUpload = middle.upload;

fieldname 'file' yang digunakan untuk mengirim file upload.

const upload = middleUpload.files_upload.single('file');
app.route(YOUR_API)
.post(middle.permission, (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof middleUpload.multer_err) { // Handle Unknown Error
            const msg = {
                header: {
                    message: err.message,
                    status: 500,
                },
                data: { code: err.code },
            };
            return res.status(500).json(msg);
        }
        if (err) {
            return res.status(500).json(err);
        }
        controller.create(req, (result) => {
            result.header.access = req.param.access.data.access;
            res.status(result.header.status).json(result);
        });
    });
};)

# Setup SendToFileManager untuk handle upload, replace , delete Pada Controller

const { sendToFileManager } = require('@agustriadji/upload-files');
sendToFileManager(data, (err, value) => {
    if (err) return next(true, value);
    return next(null, data);
});

sendToFileManager memiliki 2 param :
-   param pertama type object dengan attribute name
    
    { filename: String, path: String, action:String }.

-   param kedua berupa callback(error, result)
    
    error type String dan result type Object.

**Penggunaan sendToFileManager**

-   **UPLOAD**
    
    param pertama = { filename: String, path: String, action:String }.

-   **REPLACE**
    
    param pertama = { currentFilename: String, filename: String, path: String, action:'replace' },
    **currentFilename** = filename yang disimpan pada DB, 
    tujuannya tidak merubah nama file hanya merubah data file dengan ext yang sama.
    **filename** = filename yang diterima oleh request client.
    **path** = nilai yang di ambil dari config/upload.js **(filePath)**

-   **DELETE**
    
    param pertama = { filename: String, path: String, action:'delete' },
    **filename** = filename yang telah diambil dari DB.
    **path** = nilai yang di ambil dari config/upload.js **(filePath)**

# Setup getFileManager untuk download pada Controller

getFileManager(data, (value) => {
    if (value.status !== 200)
        return next(buildRes.error.data_notFound, null);
    const paths = './tmp/${data.filename}';
    return next(null, paths);
});

getFileManager memiliki 2 param :
-   param pertama type object dengan attribute name
    
    { filename: String, path: String}.

-   param kedua berupa callback(error, result)
    
    error type Object dan result type Object.

**Penggunaan getFileManager**

-   **DOWNLOAD**

    param pertama = { filename: String, path: String },
    **filename** = data filename yang telah diambil dari DB.
    **path** = data path yang telah diambil dari DB.

-   **VIEW**

    param pertama = { filename: String, path: String },
    **filename** = data filename yang telah diambil dari DB.
    **path** = data path yang telah diambil dari DB.
