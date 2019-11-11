import fs from 'fs';
import path from 'path';
import * as config from './config';


/**
 * 从jiraInfo.json文件中读取chatid
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
export async function getYApiChatId(e){
  let id = await readText("/data/yapiInfo.json").then((data) => {
    let cb = JSON.parse(data);
    let chatid;
    for(let item of cb) {
      if(item.pid == e){
        chatid = item.chatid;
        return chatid;
      }
    }
  }).catch((err) =>{
    console.log('err', err);
  });
  return id;
}

/**
 * 从jiraInfo.json文件中读取chatid
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
export async function getJiraChatId(e, type){
  let id = await readText("/data/jiraInfo.json").then((data) => {
    let cb = JSON.parse(data);
    let chatid;
    for(let item of cb) {
      if(item.pid == e && item.groupType == type){
        chatid = item.chatid;
        return chatid;
      }
    }
  }).catch((err) =>{
    console.log('err', err);
  });
  return id;
}

/**
 * 从bitbucketInfo.json文件中读取chatid
 * @param  {[String]} e 项目id
 * @return {[String]} 群聊chatid
 */
export async function getChatId(e){
  let id = await readText("/data/bitbucketInfo.json").then((data) => {
    let cb = JSON.parse(data);
    let chatid;
    for(let item of cb) {
      if(item.pid == e){
        chatid = item.chatid;
        return chatid;
      }
    }
  }).catch((err) =>{
    console.log('err', err);
  });
  return id;
}

/**
 * 读取json文件函数
 * @param  {[String]} pathname 路径+文件名
 * @return {[String]} json文件内容
 */
export async function readText(pathname) {
    var bin = fs.readFileSync(path.join(__dirname +　pathname));
    if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
        bin = bin.slice(3);
    }
    return bin.toString('utf-8');
}

/**
 * 写入json文件函数
 * @param  {[type]} data
 * @return {[object]} json对象
 */
export async function writeText(data, pfile) {
  let allData;
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname +　`${pfile}`), data, async (err) => {
      if(err) throw err;
      allData = await readText(`${pfile}`);
      allData = JSON.parse(allData);
      resolve(allData);
    })
  }).then((cb) => {
    return cb;
  });
}

/**
 * 判断是否跨域函数
 * @param  {[String]}  origin  正在请求地址的origin
 * @param  {[Array]}  allowedOrigin 允许的origin集合
 * @return {Boolean}   true：允许  false:不允许
 */
export function isOriginAllowed(origin, allowedOrigin) {
  if(allowedOrigin instanceof Array){
    let self = allowedOrigin.toString().split(',');
      for(let i = 0; i < self.length; i++) {
        if(isOriginAllowed(origin, self[i]) === true){
          return true;
        }
      }
      return false;
  }else if (typeof allowedOrigin == 'string'){
    return origin === allowedOrigin;
  }else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  }else {
    return !!allowedOrigin;
  }
}

export async function diffent(arr1, arr2) {
  let arr = arr1.concat(arr2);
  return arr.filter((v) => {
    return arr.indexOf(v) === arr.lastIndexOf(v);
  })
}
