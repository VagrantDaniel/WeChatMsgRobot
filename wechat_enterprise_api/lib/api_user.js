'use strict'

var util = require('./utils');
var extend = require('util')._extend;
var wrapper = util.wrapper;

/**
 * 获取部门成员
 * @param  {Number}   departmentId 获取的部门id
 * @param  {Boolean}   fetch_child 1/0：是否递归获取子部门下面的成员
 * @param  {Function} callback     [description]
 * @return {[type]}                [description]
 */
exports._getUser = function(departmentId, fetch_child, callback) {
  var url = this.qyapiPrefix + 'user/simplelist?access_token=' + this.store['accessToken'] + '&department_id=' + departmentId + '&fetch_child=' + fetch_child;
  return this.request(url, {dataType: 'json'}, wrapper(callback));
}

/**
 * 获取部门成员详情
 */
 exports._getUserList = function(departmentId, fetch_child, callback) {
   var url = this.qyapiPrefix + 'user/list?access_token=' + this.store['accessToken'] + '&department_id=' + departmentId + '&fetch_child=' + fetch_child;
   return this.request(url, {dataType: 'json'}, wrapper(callback));
 }
