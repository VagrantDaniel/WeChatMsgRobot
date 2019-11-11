'use strict'

import { _extend } from 'util';

import * as utils from './utils';

var wrapper = utils.wrapper;
var postJSON = utils.postJSON;

/**
 * 通讯录成员同步
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports._contactSync = function(callback){
  var url = this.qyapiPrefix + 'sync/contact_sync_success?access_token=' + this.store['accessToken'];
  return this.request(url, {dataType: 'json'}, wrapper(callback));
}
/**
 * 创建群聊会话
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports._createAppchat = function (name, userlist, callback) {
  let url = this.qyapiPrefix + 'appchat/create?access_token=' + this.store['accessToken'];
  let data = {};
  _extend(data, name);
  _extend(data, userlist)
  return this.request(url, postJSON(data), wrapper(callback));
}

/**
 * 群聊推送消息
 * @param  {Number}   chatid   群聊id
 * @param  {String}   message  消息主体
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports._appchatSend = function(chatid, message, callback) {
  let url = this.qyapiPrefix + 'appchat/send?access_token=' + this.store['accessToken'];
  let data = {};
  _extend(data, {
    chatid: chatid
  });
  _extend(data, message);

  return this.request(url, postJSON(data), wrapper(callback));
}

/**
 * 修改群聊回话
 * @param  {[type]}   data
 * {
 *  chatid 群聊id
 *  name 群聊名
 *  owner 群主
 *  add_user_list 添加成员
 *  del_user_list 删除成员
 * }
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports._updateAppchat = function(data, callback) {
  let url = this.qyapiPrefix + 'appchat/update?access_token=' + this.store['accessToken'];
  let dt = {};
  _extend(dt, data);

  return this.request(url, postJSON(dt), wrapper(callback));
}
