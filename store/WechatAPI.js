import * as config from '../static/config';
var WechatAPI = require('../wechat_enterprise_api/app');
const api = new WechatAPI(config.appid, config.appsecret);

export default api;
