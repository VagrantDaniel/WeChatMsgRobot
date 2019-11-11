/**
 * 对提交参数进行进一步封装
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
exports.postJSON = function (data) {
  return {
    dataType: 'json',
    method: 'POST',
    data: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

/*!
 * 对返回结果的一层封装，如果遇见微信返回的错误，将返回一个错误
 * 参见：http://mp.weixin.qq.com/wiki/index.php?title=返回码说明
 */
exports.wrapper = function (callback) {
  return function (err, data, res) {
    callback = callback || function () {};
    if (err) {
      err.name = 'WeChatAPI' + err.name;
      return callback(err, data, res);
    }
    if (data.errcode) {
      err = new Error(data.errmsg);
      err.name = 'WeChatAPIError';
      err.code = data.errcode;
      return callback(err, data, res);
    }
    callback(null, data, res);
  };
};

const JSONCtlCharsMap = {
  '"': '\\"',       // \u0022
  '\\': '\\',       // \u005c
  '\b': '\\b',      // \u0008
  '\f': '\\f',      // \u000c
  '\n': '\\n',      // \u000a
  '\r': '\\r',      // \u000d
  '\t': '\\t'       // \u0009
};
const JSONCtlCharsRE = /[\u0000-\u001F\u005C]/g;

function _replaceOneChar(c) {
  return JSONCtlCharsMap[c] || '\\u' + (c.charCodeAt(0) + 0x10000).toString(16).substr(1);
}

exports.replaceJSONCtlChars = function (str) {
  return str.replace(JSONCtlCharsRE, _replaceOneChar);
};
