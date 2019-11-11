import * as WeChat from '../service/index';
import * as utils from '../static/util';

module.exports = {

  /**
   * 发送企业应用群聊成员
   * @type {[type]}
   */
  sendWeChatMembers: async (ctx, next) => {
    let users = await WeChat._getUserList();
    ctx.response.status = 200;
    ctx.response.body = {
      code: 200,
      msg: 'ok',
      result: users
    }
    await next();
  },
  /**
   * 创建群聊
   * @type {Object}
   */
  createChat: async (ctx, next) => {
    /**
     * groupname 群聊名
     * owner 群主
     * fname 群成员
     * pid 项目id
     * pname 项目名
     * @type {Object}
     */
    let { hookType, groupname, owner, fname, pid, pname, groupType } = ctx.request.body;
    let info = {
      "name": groupname,
      "owner": owner
    }
    let userlist = {
      "userlist": fname
    }

    // let info = {
    //   "name": "测试一下",
    //   "owner": 'ZhangRui'
    // }
    // let userlist = {
    //   "userlist": ["ZhangRui", "92b3fc122807e306dc22e8837f576a0d"]
    // }
    // let pid = '1';
    // let pname = '2';
    let cb = await WeChat._readFile(info, userlist, pid, pname, hookType, groupType);
    ctx.response.body = {
      code: 200,
      msg: 'ok',
      result: cb
    }
  },
  /**
   * 发送Bitbucket群聊信息
   * @type {Function}
   */
  sendBitbucketInfo: async (ctx, next) => {
    try{
      let cb = await utils.readText('/data/bitbucketInfo.json');
      if(cb.length > 0){
        cb = JSON.parse(cb);
      }
      ctx.response.body = {
        code: 200,
        msg: 'ok',
        result: cb,
      }
    }catch(e){
      console.log(e)
    }

  },
  /**
   * 发送Jira群聊信息
   * @type {Function}
   */
  sendJiraInfo: async (ctx, next) => {
    let cb = await utils.readText('/data/jiraInfo.json');
    if(cb.length > 0){
      cb = JSON.parse(cb);
    }
    ctx.response.body = {
      code: 200,
      msg: 'ok',
      result: cb,
    }
  },
  /**
   * 发送Jira群聊信息
   * @type {Function}
   */
  sendYApiInfo: async (ctx, next) => {
    let cb = await utils.readText('/data/yapiInfo.json');
    if(cb.length > 0){
      cb = JSON.parse(cb);
    }
    ctx.response.body = {
      code: 200,
      msg: 'ok',
      result: cb,
    }
  },
  /**
   * 发送周报群chatid
   * @param ctx
   * @param next
   * @returns {Promise<void>}
   */
  sendWeeklyInfo: async (ctx, next) => {
    let cb = await utils.readText('/data/weeklyInfo.json');
    if(cb.length > 0){
      cb = JSON.parse(cb);
    }
    ctx.response.body = {
      code: 200,
      msg: 'ok',
      result: cb,
    }
  },
  /**
   * 更新群聊信息接口
   * @type {Function}
   */
  updateAppChat: async (ctx, next) => {

    let { addnumber, chatid, deletenumber, fname, groupname, owner, pid, pname, hookType, groupType } = ctx.request.body;
    if(hookType === '3'){
      let pfile = 'weeklyInfo.json';
      let cb = JSON.parse(await utils.readText(`/data/${pfile}`));
      let trs_data = {
        chatid: chatid,
        name: groupname,
        owner: owner,
        add_user_list: addnumber,
        del_user_list: deletenumber
      };
      let txt_data = {
        hookType: hookType,
        chatid: chatid,
        groupname: groupname,
        owner: owner,
        fname: fname,
      }
      let data = cb.filter((item) => {
        return item.chatid != chatid;
      });
      data.unshift(txt_data);
      data = JSON.stringify(data);
      await utils.writeText(data, `/data/${pfile}`);
      await WeChat._updateAppchat(trs_data).then(async (cb) => {
        if(cb.msg == 'ok'){
          return;
        }
      }).catch((er) => {
        throw new Error(er);
      });
      ctx.response.body = {
        code: 200,
        msg: 'ok'
      }
    }else{
      let pfile = hookType === '0' ? 'bitbucketInfo.json' : hookType === '1' ? 'jiraInfo.json' : 'yapiInfo.json';
      let cb = JSON.parse(await utils.readText(`/data/${pfile}`));
      let trs_data = {
        chatid: chatid,
        name: groupname,
        owner: owner,
        add_user_list: addnumber,
        del_user_list: deletenumber
      };
      let txt_data = {
        hookType: hookType,
        chatid: chatid,
        groupname: groupname,
        owner: owner,
        fname: fname,
        pid: pid,
        pname: pname,
      }
      if(hookType === '1'){
        txt_data = Object.assign(txt_data, { groupType: groupType });
      }
      let data = cb.filter((item) => {
        return item.chatid != chatid;
      });
      data.unshift(txt_data);
      data = JSON.stringify(data);
      await utils.writeText(data, `/data/${pfile}`);
      await WeChat._updateAppchat(trs_data).then(async (cb) => {
        if(cb.msg == 'ok'){
          return;
        }
      }).catch((er) => {
        throw new Error(er);
      });
      ctx.response.body = {
        code: 200,
        msg: 'ok'
      }
    }
  },
  /**
   * hook回调默认返回
   * @param  {[type]}   ctx  [description]
   * @param  {Function} next [description]
   * @return {Promise}       [description]
   */
  preventRuturn: async (ctx, next) => {
    try{
      await next();
      ctx.response.body = {
        code: 200,
        msg: 'ok',
        result: {},
      }
    }catch(err){
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit("error", err, ctx);
    }
  }
}
