'use strict'

const httpx = require('httpx');
const liburl = require('url');
const JSONbig = require('json-bigint');

const {
  replaceJSONCtlChars
} = require('./utils');

class AccessToken {
  constructor(accessToken, expireTime){
    this.accessToken = accessToken;
    this.expireTime = expireTime;
  }

  /**
   * 检查AccessToken是否有效,检查规则为当前时间和过期时间进行对比
   */
  isValid() {
    return !!this.accessToken && Date.now() < this.expireTime;
  }
}

class API {
  /**
   * [constructor description]
   * @param {[String]} appid 在公共平台上申请得到的appid
   * @param {[String]} appsecret 在公共平台上申请得到的app secret
   * @param {[type]} getToken  [description]
   * @param {[type]} saveToken [description]
   * @param {[Boolean]} tokenFromCustom token是否过期的标识
   */
  constructor(appid, appsecret, getToken, saveToken, tokenFromCustom){
    this.appid = appid;
    this.appsecret = appsecret;
    this.store = null;
    this.getToken = getToken || async function () {
      return this.store;
    };
    this.saveToken = saveToken || async function(token){
      this.store = token;
      if(process.env.NODE_ENV === 'production'){
        console.warn('Don\'t save token in memory, when cluster or multi-computer!');
      }
    };
    this.qyapiPrefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
  }

  /**
   * [setOpts description]
   * @param {[Object]} opts 默认选项
   */
  setOpts(opts){
    this.defaults = opts;
  }
  /**
   * 通用请求调用函数
   * @param  {[String]}  url   请求地址
   * @param  {[Object]}  opts  请求参数
   * @param  {[Number]}  retry 尝试次数
   * @return {Promise}       [description]
   */
  async request(url, opts, retry){

    if(typeof retry === 'undefined'){
      retry = 3;
    }

    var options = {};
    Object.assign(options, this.defaults);
    opts || (opts = {});
    var keys = Object.keys(opts);
    for(var i = 0;i < keys.length;i++){
      var key = keys[i];
      if(key != 'headers'){
        options[key] = opts[key];
      }else{
        if(opts.headers){
          options.headers = options.headers || {};
          Object.assign(options.headers, opts.headers);
        }
      }
    }
    try{
      var res = await httpx.request(url, options);
    }catch(err){
      throw err;
    }
    if(res.statusCode < 200 || res.statusCode > 204){
      var err = new Error(`url: ${url}, status code: ${res.statusCode}`);
      err.name = 'WeChatAPIError';
      throw err;
    }

    var buffer = await httpx.read(res);
    var contentType = res.headers['content-type'] || '';
    if(contentType.indexOf('application/json') !== -1){
      var data;
      var origin = buffer.toString();
      try{
        /**
         * replaceJSONCtlChars可以把对象的键双引号去掉，建议与JSONbig.parse联用
         */
        data = JSONbig.parse(replaceJSONCtlChars(origin));
        // console.log('data', data)
      }catch(ex){
        let err = new Error('JSON.parse error. buffer is ' + origin);
        err.name = 'WeChatAPIError';
        throw err;
      }
      if(data && data.errcode){
        let err = new Error(data.errmsg);
        err.name = 'WeChatAPIError';
        err.code = data.errcode;

        if((err.code === 40001 || err.code === 42001) && retry > 0 && !this.tokenFromCustom){
          // 销毁已过期的token
          await this.saveToken(null);
          let token = await this.getAccessToken();
          let urlobj = liburl.parse(url, true);

          if(urlobj.query && urlobj.query.access_token){
            urlobj.query.access_token = token.accessToken;
            delete urlobj.search;
          }
          return this.request(liburl.format(urlobj), opts, retry - 1);
        }
        throw err;
      }
      return data;
    }
    return buffer;
  }


  /**
   * 根据传入的appid和appsecret获取access token
   * 进行后续所有API调用时，需要先获取access_token
   * @return {Promise} [description]
   */
  async getAccessToken(){
    // https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww7793c98606e571f8&corpsecret=iDROtb5sYOa7L6U78cBX57hodAb103GOy2aFZhM61RI
    var url = this.qyapiPrefix + 'gettoken?corpid=' + this.appid + '&corpsecret=' + this.appsecret;
    try{
      var data = await this.request(url);
    }catch(err){
      throw err;
    }
    // 过期时间，因网络延迟等，将实际过期时间提前10秒，以防止临界点
    var expireTime = Date.now() + (data.expires_in - 10) * 1000;
    var token = new AccessToken(data.access_token, expireTime);
    await this.saveToken(token);
    return token;
  }

  /**
   * 需要access token的接口调用
   * 无需依赖`getAccessToken`为前置调用
   * Examples
   * ```
   * await api.ensureAccessToken();
   * ```
   * @return {Promise} [description]
   */
  async ensureAccessToken() {
    // 调用童虎传入的获取token的异步方法，获取token之后使用（并缓存它）
    var token = await this.getToken();
    var accessToken;
    if(token && (accessToken = new AccessToken(token.accessToken, token.expireTime)).isValid()){
      return accessToken;
    }
    else if(this.tokenFromCustom) {
      let err = new Error('accessToken Error');
      err.name = 'WeChatAPIError';
      err.code = 42001;
      throw err;
    }
    return this.getAccessToken();
  }
}

API.mixin = function(obj){
  for(var key in obj){
    if(API.prototype.hasOwnProperty(key)){
      throw new Error('Don\'t allow override existed prototype method. method: '+ key);
    }
    API.prototype[key] = obj[key];
  }
};

API.AccessToken = AccessToken;

module.exports = API;
