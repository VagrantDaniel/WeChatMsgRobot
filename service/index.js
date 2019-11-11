import { _extend } from 'util';

import * as config from '../static/config';
import * as utils from '../static/util';
import WechatAPI from '../wechat_enterprise_api/app';

var api = new WechatAPI(config.appid, config.appsecret);

export async function _getUserList(){
  let users = {};
  await api.ensureAccessToken();
  await api._getDepartments().then(async (data) => {
    await api._getUserList('3', true).then(async (data) => {
      await data.userlist.map((item, index) => {
        users[item.userid] = item.name;
      }, '')
    }).catch((er) => {
      throw new TypeError(er);
    })
    await api._getUserList('5', true).then(async (data) => {
      await data.userlist.map((item, index) => {
        users[item.userid] = item.name;
      }, '')
    }).catch((er) => {
      throw new TypeError(er);
    })
    await api._getUserList('10', true).then(async (data) => {
      await data.userlist.map((item, index) => {
        users[item.userid] = item.name;
      }, '')
    }).catch((er) => {
      throw new TypeError(er);
    })
    await api._getUserList('9', true).then(async (data) => {
      await data.userlist.map((item, index) => {
        users[item.userid] = item.name;
      }, '')
    }).catch((er) => {
      throw new TypeError(er);
    })
  }).catch((er) => {
    throw new TypeError(er);
  })
  return users;
}

export async function _createAppchat(info, userlist){
  await api.ensureAccessToken();
  let data_cb = {};
  await api._createAppchat(info, userlist).then(async (data) => {
    let message = {
      "msgtype":"text",
      "text":{
          "content" : "Welcome!"
      },
      "safe":0
    }
    if(data.errmsg == 'ok'){
      let chatid = data.chatid;
      await api._appchatSend(data.chatid, message).then(async (data) => {
        if(data.errmsg == 'ok'){
          data_cb.errcode = 0;
          data_cb.errmsg = "ok";
          data_cb.chatid = chatid;
        }
      })
    }
  }).catch((er) => {
    console.log(er);
  })
  return data_cb;
}

export async function _updateAppchat(info){
    console.log('info', info)
    await api.ensureAccessToken();

    let data_cb = {};
    await api._updateAppchat(info).then(async (data) => {
      if(data.errmsg == 'ok') {
        let users = await _getUserList();
        let come_in = [], leave_out = [];
        function getUserNameIn(user_id) {
          for(let i in users) {
            if(i == user_id){
              return users[i];
            }
          }
        }
        function getUserNameOut(user_id) {
          for(let i in users) {
            if(i == user_id){
              return users[i];
            }
          }
          return null;
        }
        let { chatid, add_user_list, del_user_list } = info;
        for(let i in add_user_list){
          !!getUserNameIn(add_user_list[i]) && come_in.push(getUserNameIn(add_user_list[i]));
        }
        for(let i in del_user_list){
          !!getUserNameOut(del_user_list[i]) && leave_out.push(getUserNameOut(del_user_list[i]));
        }
        // let differ = utils.diffent(add_user_list.split(','), del_user_list.split(','));
        let msg;
        if(come_in.length > 0){
          msg = come_in.join(',') + '刚刚加入。每个人，看起来很忙 ！';
        }
        if(leave_out.length > 0){
          if(!!msg){
            msg += leave_out.join(',') + '离开了。';
          }else{
            msg = leave_out.join(',') + '离开了。';
          }
        }
        let message = {
          "msgtype":"text",
          "text":{
              "content" : msg
          },
          "safe":0
        }
        msg = '';
        come_in = '';
        leave_out = '';
        await api._appchatSend(chatid, message).then(async (cb) => {
          if(cb.errmsg == 'ok'){
            data_cb.code = 200;
            data_cb.msg = 'ok';
          }
        });
      }
    }).catch((er) => {
      console.log(er);
    })
    return data_cb;
}

export async function _readFile(info, userlist, pid, pname, hookType, groupType) {
  await api.ensureAccessToken();
  let allData;
  if(hookType === '3'){
    let pfile = 'weeklyInfo.json';
    await _createAppchat(info, userlist).then(async (cb) => {
      if(cb.errmsg == 'ok') {
        let cb_data = await utils.readText(`/data/${pfile}`);
        if(cb_data.length > 0){
          cb_data = JSON.parse(cb_data);
        }else{
          cb_data = [];
        }
        let data = cb_data.filter((item) => {
          return item.chatid !== cb.chatid;
        })
        hookType === '0' ?
            data.unshift({
              "hookType": hookType,
              "chatid": cb.chatid,
              "groupname": info.name,
              "owner": info.owner,
              "fname": userlist.userlist,
            }) : data.unshift({
              "hookType": hookType,
              "chatid": cb.chatid,
              "groupname": info.name,
              "owner": info.owner,
              "fname": userlist.userlist,
            })
        let trs_data = JSON.stringify(data);
        const allData = await utils.writeText(trs_data, `/data/${pfile}`)
      }
    })
  }else{
    let pfile = hookType === '0' ? 'bitbucketInfo.json' : hookType === '1' ? 'jiraInfo.json' : 'yapiInfo.json';
    await _createAppchat(info, userlist).then(async (cb) => {
      if(cb.errmsg == 'ok') {
        let cb_data = await utils.readText(`/data/${pfile}`);
        if(cb_data.length > 0){
          cb_data = JSON.parse(cb_data);
        }else{
          cb_data = [];
        }
        let data = cb_data.filter((item) => {
          return item.chatid !== cb.chatid;
        })
        hookType === '0' ?
            data.unshift({
              "hookType": hookType,
              "chatid": cb.chatid,
              "groupname": info.name,
              "owner": info.owner,
              "fname": userlist.userlist,
              "pid": pid,
              "pname": pname
            }) : data.unshift({
              "hookType": hookType,
              "chatid": cb.chatid,
              "groupname": info.name,
              "groupType": groupType,
              "owner": info.owner,
              "fname": userlist.userlist,
              "pid": pid,
              "pname": pname
            })
        let trs_data = JSON.stringify(data);
        const allData = await utils.writeText(trs_data, `/data/${pfile}`)
      }
    })
  }
  return allData;
}
