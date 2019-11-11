'use strict'

var util = require('./utils');
var extend = require('util')._extend;
var wrapper = util.wrapper;
var postJSON = util.postJSON;

/**
 * 发送消息到应用
 * @param  {[String]}   agentid 应用id
 * @param  {[Object]}   to 消息主体
 * @param  {[Object]}   message
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports._sendMessage = function(agentid, to, message, callback){
  var url = this.qyapiPrefix + 'message/send?access_token=' + this.store['accessToken'];
  var data = {};
  extend(data, to);
  extend(data, {
    agentid: parseInt(agentid)
  });
  extend(data, message);

  this.request(url, postJSON(data), wrapper(callback));
};

// export
