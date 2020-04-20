/**
 *
 * RELASI DENGAN FILE .env
 * Ini adalah file main config untuk apps, yang mencakupi pengaturan sebagai berikut :
 * PATH : pengaturan folder pada apps penggunaan _PATH._PUBLIC('filename') or _PATH._PUBLIC().filename
 * DB_CONFIG : pengaturan config db, penggunaan _DB_CONFIG.objectname
 * IMAGE_SERVER : pengaturan url upload , penggunaan _IMAGE_SERVER(1-n)
 * AUTH_URL : pengaturan config untuk permission, data berupa object
 * MAIL : pengaturan mail config
 *
 * @format
 */

const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error;
}
const { parsed: envs } = result;

const cfg = {
    MAIN_SERVICE: {
        name: envs.SERVICE_NAME,
        page: envs.SERVICE_PAGE,
    },
    SERVE_APP: {
        url: envs.APP_URL,
        port: envs.APP_PORT,
    },
    DB_CONFIG: {
        host: envs.DB_HOST,
        port: envs.DB_PORT,
        database: envs.DB_DATABASE,
        username: envs.DB_USERNAME,
        password: envs.DB_PASSWORD,
    },
    FILE_MANAGER: {
        url: envs.FILE_MANAGER_URL,
        port: envs.FILE_MANAGER_PORT,
    },
    AUTH_URL: {
        url: envs.SERVE_CENTRE_URL,
        port: envs.SERVE_CENTRE_PORT,
    },
    MAIL: {
        driver: envs.MAIL_DRIVER,
        host: envs.MAIL_HOST,
        port: envs.MAIL_PORT,
        username: envs.MAIL_USERNAME,
        password: envs.MAIL_PASSWORD,
        encrypt: envs.MAIL_ENCRYPT,
        from: envs.MAIL_FROM,
        mail_name: envs.MAIL_NAME,
    },
};

module.exports = cfg;
