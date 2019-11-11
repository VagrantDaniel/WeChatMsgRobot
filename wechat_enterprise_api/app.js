var API = require('./lib/api_common');

// 消息发送
API.mixin(require('./lib/api_message'));

// 获取企业列表
API.mixin(require('./lib/api_department'));

// 获取部门成员
API.mixin(require('./lib/api_user'));

//创建群聊会话
API.mixin(require('./lib/api_appchat'));

module.exports = API;
