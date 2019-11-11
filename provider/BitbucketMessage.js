import moment from 'moment';
import BitbucketWebhookHandler from '../koa-bitbucket-webhook-handler/app';
import redis from '../store/redis';
import * as utils from '../static/util';
import WebhookHandler from '../store/webhookHander';
import api from '../store/WechatAPI';

/**
 * push事件
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('push', async function(event) {
  console.log('push event=======>', event.payload)
  let link = [...event.payload.repository.links.self][0].href.replace('browse', 'commits');
  let chatid = await utils.getChatId(event.payload.repository.id);
  let notifity = backend_member.filter((item) => item != event.payload.actor.displayName);
  if(event.payload.changes[0].refId.indexOf('master') != -1 || event.payload.changes[0].refId.indexOf('develop') != -1){
    let contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
      '\n项目：' + event.payload.repository.project.name + '的<font color=\'info\'>' + event.payload.repository.name + '</font>'+
      '\n' + event.payload.actor.displayName + '@' + notifity +
      '\n详情：' + '<font color=\'info\'>' + event.payload.changes[0].refId.substr(11) + '</font>分支改变了' +
      '\nfromHash：<font color=\'comment\'>' + event.payload.changes[0].fromHash + '</font>' +
      '\ntoHash：<font color=\'comment\'>' + event.payload.changes[0].toHash + '</font>' +
      '\n链接：[](' + link + ')';
    let message = {
      "msgtype" : "markdown",
      "markdown" : {
          "content" : contents
      },
      "safe":0
    }
    await api.ensureAccessToken();
    api._appchatSend(chatid, message);
  }
})

/**
 * 发起合并请求
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('pr:opened', async function(event){

  console.log('Received a pr:opened event', event.payload);
  // let reviewers = event.payload.pullRequest.reviewers.reduce((prev, next, index) => {
  //   return index > 0 ? prev + ', ' + next.user.displayName : prev + next.user.displayName;
  // }, '')
  let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
    let reviewers;
  for(let item in event.payload.pullRequest.reviewers){
    item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
  }
  if(!reviewers) {
    reviewers = event.payload.actor.displayName;
  }
  let commitMessage = event.payload.pullRequest.description ? event.payload.pullRequest.description : '无';
  let contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
    '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
    '\n项目编号：' + event.payload.pullRequest.id +
    '\n<font color=\'info\'>' + event.payload.actor.displayName + '</font>发起了合并请求,请<font color=\'warning\'>' + reviewers + '</font>尽快处理该请求' +
    '\n详情：' + '分支从 <font color=\'info\'>' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'info\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
    '\nCommit Message：<font color=\'info\'>' + commitMessage + '</font>' +
    '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
  let message = {
    "msgtype" : "markdown",
    "markdown" : {
        "content" : contents
    },
    "safe":0
  }
  await api.ensureAccessToken();
  api._appchatSend(chatid, message);
})

/**
 * 审核人merge操作
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('pr:merged', async function(event){
   // console.log('Received a pr:merged event',event);
   let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
   let reviewers;
   for(let item in event.payload.pullRequest.reviewers){
     item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
   }
   let contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
     '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
     '\n项目编号：' + event.payload.pullRequest.id +
     '\n来自<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>的合并请求' +
     '\n<font color=\'warning\'>' + event.payload.actor.displayName + '</font>已经合并了' +
     '\n详情：' + '分支从 <font color=\'info\'>' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'info\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
     // '\n前一条review hash：' + event.payload.participant.lastReviewedCommit +
     '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
   let message = {
     "msgtype" : "markdown",
     "markdown" : {
         "content" : contents
     },
     "safe":0
   }
   await api.ensureAccessToken();
   api._appchatSend(chatid, message);
   // var AccessToken = api.getAccessToken().then(() =>{
   //   api._appchatSend(config.frontend_chatid, message);
   // });
})

/**
 * 管理员commit的时候会触发
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('pr:reviewer:merged', async function(event) {
   // console.log('Received a pr:reviewer:merged event', event);
   let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
   let reviewers;
   for(let item in event.payload.pullRequest.reviewers){
     item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
   }
   let contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
     '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
     '\n项目编号：' + event.payload.pullRequest.id +
     '\n来自<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>的合并请求' +
     '\n<font color=\'warning\'>' + event.payload.actor.displayName + '</font>已经合并了' +
     '\n详情：' + '分支从<font color=\'info\'> ' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'info\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
     '\n前一条review hash：<font color=\'comment\'>' + event.payload.participant.lastReviewedCommit + '</font>' +
     '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
   let message = {
     "msgtype" : "markdown",
     "markdown" : {
         "content" : contents
     },
     "safe":0
   }
   await api.ensureAccessToken();
   api._appchatSend(chatid, message);
})

WebhookHandler.on('pr:comment:added', async function(event) {
   let msg = '';
   await redis.get(event.payload.comment.properties.repositoryId + event.payload.pullRequest.fromRef.id + event.payload.pullRequest.toRef.id).then((res) => {
     if(!!res){
       msg = res + '|';
     }
   }).catch((er) => {
     throw new Error(er);
   });
   redis.multi()
      .set(event.payload.comment.properties.repositoryId + event.payload.pullRequest.fromRef.id + event.payload.pullRequest.toRef.id, msg + event.payload.comment.text)
      .exec((err) => {
        console.error(err);
        return;
      });
})
/**
 * needs_work事件
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('pr:reviewer:needs_work', async function(event) {
  let commentMessage = "";
  await redis.get(event.payload.pullRequest.fromRef.repository.id + event.payload.pullRequest.fromRef.id + event.payload.pullRequest.toRef.id).then((res) => {
    if(!!res){
      let arr = res.split('|');
     for(let i = 0; i < arr.length; i++){
       commentMessage += '\n<font color=\'warning\'>' + (i+1) + ':' + arr[i] + '</font>';
     }
    }
  }).catch((er) => {
    throw new Error(er);
  });
   let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
   let reviewers;
   for(let item in event.payload.pullRequest.reviewers){
     item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
   }
   let contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
     '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
     '\n项目编号：' + event.payload.pullRequest.id +
     '\nReviewers：`' + reviewers  + '`' +
     '\n<font color=\'info\'>' + event.payload.actor.displayName + '</font>建议<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>修改后再发起合并请求' +
     '\n详情：' + '分支从 <font color=\'warning\'>' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'warning\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
     '\n前一条review hash：<font color=\'comment\'>' + event.payload.participant.lastReviewedCommit + '</font>' +
     '\nCommit Message：' + event.payload.pullRequest.description +
     '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')' +
     '\n修改意见：' + commentMessage;
   let message = {
     "msgtype" : "markdown",
     "markdown" : {
         "content" : contents
     },
     "safe":0
   }
   await api.ensureAccessToken();
   api._appchatSend(chatid, message);
})

/**
 * unapproved事件
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('pr:reviewer:unapproved', async function(event) {
  let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
  let reviewers;
  for(let item in event.payload.pullRequest.reviewers){
    item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
  }
 let contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
   '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
   '\n项目编号：' + event.payload.pullRequest.id +
   '\nReviewers：`' + reviewers  + '`' +
   '\n<font color=\'info\'>' + event.payload.actor.displayName + '</font>不同意<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>的合并请求' +
   '\n详情：' + '分支从 <font color=\'warning\'>' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'warning\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
   '\n前一条review hash：<font color=\'comment\'>' + event.payload.participant.lastReviewedCommit + '</font>' +
   '\nCommit Message：' + event.payload.pullRequest.description +
   '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
 let message = {
   "msgtype" : "markdown",
   "markdown" : {
       "content" : contents
   },
   "safe":0
 }
 await api.ensureAccessToken();
 api._appchatSend(chatid, message);
})

/**
 * approved事件
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 *
 */
WebhookHandler.on('pr:reviewer:approved', async function(event) {
  let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
  await redis.get(event.payload.pullRequest.fromRef.repository.id + event.payload.pullRequest.fromRef.id + event.payload.pullRequest.toRef.id).then((res) => {
    if(!!res){
      redis.del(event.payload.pullRequest.fromRef.repository.id + event.payload.pullRequest.fromRef.id + event.payload.pullRequest.toRef.id);
    }
  })
 let reviewers, unreviewers = [], contents, flag = 0;
 for(let item in event.payload.pullRequest.reviewers){
   // console.log(event.payload.pullRequest.reviewers[0], item)
   item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
 }
 event.payload.pullRequest.reviewers.map((item, index) => {
   if(!item.approved){
     unreviewers.push(item.user.displayName);
   }else{
     flag++;
   }
 })
 let commitMessage = event.payload.pullRequest.description ? event.payload.pullRequest.description : '无';
 if(flag == event.payload.pullRequest.reviewers.length){
   contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(12,7) +
     '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
     '\nReviewers：`' + reviewers + '`' +
     '\n<font color=\'warning\'>' + event.payload.actor.displayName + '</font>同意来自<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>的合并请求' +
     '\n详情：' + '分支从 <font color=\'info\'>' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'info\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
     '\n前一条review hash：<font color=\'comment\'>' + event.payload.participant.lastReviewedCommit + '</font>' +
     '\nCommit Message：<font color=\'comment\'>' + commitMessage + '</font>'
     '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
 }else{
   contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,8) +
     '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
     '\nReviewers：`' + reviewers + '`' +
     '\n<font color=\'warning\'>' + event.payload.actor.displayName + '</font>同意来自<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>的合并请求' +
     '\n请<font color=\'warning\'>' + unreviewers.join(',') + '</font>尽快同意来自<font color=\'info\'>' + event.payload.pullRequest.author.user.displayName + '</font>的合并请求' +
     '\n详情：' + '分支从<font color=\'warning\'> ' + event.payload.pullRequest.fromRef.displayId + '</font>-><font color=\'warning\'>' + event.payload.pullRequest.toRef.displayId + '</font>' +
     '\n前一条review hash：<font color=\'comment\'>' + event.payload.participant.lastReviewedCommit + '</font>' +
     '\nCommit Message：<font color=\'comment\'>' + commitMessage + '</font>' +
     '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
 }
 let message = {
   "msgtype" : "markdown",
   "markdown" : {
       "content" : contents
   },
   "safe":0
 }
 await api.ensureAccessToken();
 api._appchatSend(chatid, message);
})

WebhookHandler.on('pr:modified', async function(event) {
  // console.log("pr:modified event", event.payload)
  let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
  let contents, reviewers;
  for(let item in event.payload.pullRequest.reviewers){
    item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
  }
  contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,7) +
   '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
        '\n<font color=\'warning\'>' + event.payload.pullRequest.author.user.displayName + '</font>提醒<font color=\'info\'>' + reviewers + '</font>,项目编号：**' + event.payload.pullRequest.id + '**代码已经更新，可以合并了。' +
        '\n链接：[](' + [...event.payload.pullRequest.links.self][0].href + ')';
        let message = {
          "msgtype" : "markdown",
          "markdown" : {
              "content" : contents
          },
          "safe":0
        }
        await api.ensureAccessToken();
        api._appchatSend(chatid, message);
})
/**
 * delete事件
 * @type {Array}
 */
 WebhookHandler.on('pr:deleted', async function(event) {
   let chatid = await utils.getChatId(event.payload.pullRequest.fromRef.repository.id);
   let contents,reviewers;
   for(let item in event.payload.pullRequest.reviewers){
     item == 0 ? reviewers = event.payload.pullRequest.reviewers[0].user.displayName : reviewers += ', ' + event.payload.pullRequest.reviewers[item].user.displayName;
   }
   contents = '时间：' + event.payload.date.substr(0,10) + ' ' + event.payload.date.substr(11,7) +
     '\n项目：' + event.payload.pullRequest.fromRef.repository.project.name + '的**' + event.payload.pullRequest.fromRef.repository.name + '**' +
     '\n<font color=\'warning\'>' + event.payload.pullRequest.author.user.displayName + '</font>提醒<font color=\'info\'>' + reviewers + '</font>,项目编号：**' + event.payload.pullRequest.id + '**已经删除了';
   let message = {
     "msgtype" : "markdown",
     "markdown" : {
         "content" : contents
     },
     "safe":0
   }
   await api.ensureAccessToken();
   api._appchatSend(chatid, message);
 })
