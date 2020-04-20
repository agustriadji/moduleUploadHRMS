const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs') ;

const uploadConfig = require('../../config/upload');

const { fileTmp } = uploadConfig; 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fileTmp)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
  })


function fileFilter (req, file, cb){
    
    let msg = {
        header : {
            message : 'Error',
            status : 500,
            access : null
        },data:null
    };

    if(file){ // only running with content-type multipart/form
        let
        splitFilename = file.originalname.split(' '),
        joinFilename = splitFilename.join('_'),
        split_ext = joinFilename.split('.'),
        ext       = split_ext[1],
        check_ext = uploadConfig.fileExt.indexOf(ext.toLowerCase()); 
        
        if(split_ext.length > 2){
            msg.header.message = uploadConfig.message.error.filename;
            return cb(msg);
        }
        if(check_ext < 0){ 
            msg.header.message = uploadConfig.message.error.supportExt;
            return cb(msg); 
        }
        if(file.size > uploadConfig.fileSize){
            msg.header.message = uploadConfig.message.error.size;
            return cb(msg); 
        }

        file.data = {
            filename : split_ext[0]+'_'+Date.now()+'.'+ext,
            path : uploadConfig.filePath
        }
        file.originalname = file.data.filename;
        
        
        return cb(null,true);
    }else{
        return cb(null,false); // request not multipart
    }
}


const uploads = multer({
                    fileFilter : fileFilter,
                    storage : storage,
                    limits : uploadConfig.limits
                });
const actionUpload = ['replace','save'];

module.exports =  {
    files_upload : uploads,
    multer_err  : multer.MulterError,
	sendToFileManager : (data,callback_send)=>{
        var bodyFormData = new FormData();
        if (actionUpload.indexOf(data.action) !== -1){
            bodyFormData.append('filebuffer', fs.createReadStream(`${fileTmp}/${data.filename}`));    
        }
        
        bodyFormData.append('filepath', `${data.path}${data.filename}`);
        bodyFormData.append('action', data.action);

        axios.create({
            headers: bodyFormData.getHeaders()
        }).post(uploadConfig.urlStore,bodyFormData)
        .then(function (response) {
            if(response.data.header.status == 200){
                fs.unlinkSync(`${fileTmp}/${data.filename}`);
                return callback_send(null, data);
            }else{
                return callback_send(true,'Upload Failed')
            }
        }).catch(function (error) {
            return callback_send(true,'Upload Error')
        });
    },
    getFileManager : (data,callback_send)=>{
        axios.get(`${uploadConfig.urlStore}?filepath=${data.path}`)
        .then(function (response) {
            if(response.data.header.status == 200){
                return callback_send(null, response.data);
            }else{
                return callback_send(true,'Get file failed')
            }
        }).catch(function (error) {
            return callback_send(true,'Cannot get file')
        });
    }
};

