'use strict'

var util = require('./utils');
var extend = require('util')._extend;
var wrapper = util.wrapper;

/**
 * 获取部门列表
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports._getDepartments = function (callback) {
  var url = this.qyapiPrefix + 'department/list?access_token=' + this.store['accessToken'];
  return this.request(url, {dataType: 'json'}, wrapper(callback));
}
