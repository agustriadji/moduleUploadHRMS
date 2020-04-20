const appCnf = require('./app');

// Filter
const fileExt = ["doc","docx","pdf"];
const maxSizeString =  "1 MB";
const fileSize =  1048576;
let msgSupportExt = '';
for(var i=0; i < fileExt.length; i += 1){
    if(i === fileExt.length-1){
        msgSupportExt += `and ${fileExt[i]}.`;
    }else{
        msgSupportExt += `${fileExt[i]}, `;
    }
}

module.exports = {
    urlStore: `${appCnf.FILE_MANAGER.url}:${appCnf.FILE_MANAGER.port}/uploadFile`,
    urlGet: `${appCnf.FILE_MANAGER.url}:${appCnf.FILE_MANAGER.port}/getFile`,
    // destination folder
    filePath: "/hrms_upload/job_attach/",
    fileExt: fileExt, 
    fileSize: fileSize,
    limits: {
        files : 1,
        fileSize : fileSize,
    },
    fileTmp: './tmp',
    error: {
        filename: "file name must be ('Letter - _ 0-9').",
        supportExt: `unsupported format, only support for extension file ${msgSupportExt}`,
        size: `File upload only accept up to ${maxSizeString}.`,
    },
};