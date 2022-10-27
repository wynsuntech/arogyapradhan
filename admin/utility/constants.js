const constants = {};
constants.FILE_TYPE_IMAGE = 1;
constants.FILE_TYPE_DOCS = 2;
constants.FILE_TYPE_VIDEO = 3;

// USER STATUS
constants.USER_NOT_ACCEPTED = 0;
constants.USER_ACCEPTED = 1;
constants.USER_CHAT_ENDED = 2;

constants.S3_URL = 'https://duvim.s3.ap-south-1.amazonaws.com/';
constants.S3_URL_END = "https://duvim.s3.ap-south-1.amazonaws.com/"



const OPEN_FIRE_DOMAIN = '40.122.127.0';
constants.OPEN_FIRE_DOMAIN = OPEN_FIRE_DOMAIN;
constants.OPEN_FIRE_ROOM_DOMAIN = 'conference.' + OPEN_FIRE_DOMAIN;
constants.BUCKET_NAME = "duvim";
constants.IAM_USER_KEY = "AKIAZ3AXMMACLYKFCUXW";
constants.IAM_USER_SECRET = "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";
constants.S3_URL_1 = 'http://s3.amazonaws.com/';
constants.S3_REGION = "ap-south-1"

module.exports = constants;