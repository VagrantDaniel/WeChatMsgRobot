import moment from 'moment';
import WebhookHandler from '../store/webhookHander';
import api from '../store/WechatAPI';
import * as utils from '../static/util';

/**
 * jira创建问题
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('issue_created', async function (event) {
  const { timestamp, issue, changelog } = event.payload;

  // issueId: 问题id
  let issueId = issue.key;
  // project: 项目相关
  // creator: 创建人
  // summary: 问题概要
  // description: 问题描述
  // priority: 优先级
  // assignee: 经办人
  // attachment: 附件
  // aggregatetimeestimate: 初始预估时间
  // aggregateprogress
  // resolution：解决结果
  // issueType：问题类型
  // issueType.id: 10103 开发任务, 10005 系统缺陷
  const { project, creator, summary, priority, assignee, attachment, aggregatetimeestimate, aggregateprogress, resolution, issuetype } = issue.fields;
  let { description } = issue.fields;
  // key: 项目key
  // name: 项目名
  const { key, name } = project;
  console.log('getJiraChatId', key, issuetype.id)
  // chatid: 群聊id
  let chatid = await utils.getJiraChatId(key, issuetype.id);
  let attachmentContents = attachment.reduce((total, item, index) => {
    return [...total, item.content];
  }, [])
  description = !!description ? description: '无';
  const links = `http://192.168.214.112:7070/jira/browse/${issueId}`;
  let contents = '问题概要：[' + summary + '](' + links + ')\n' +
    '>当前经办人：**' + assignee.displayName + '**\n' +
    '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
    '><font color=\'info\'>' + creator.displayName + '</font>创建了问题, issueId：<font color=\'info\'>' + issueId + '</font>\n' +
    '>初始预估时间：<font color=\'comment\'>' + aggregatetimeestimate / 60 + 'h' + '</font>\n' +
    '>优先级：<font color=\'comment\'>' + priority.name + '</font>\n' +
    '>问题描述：<font color=\'comment\'>' + description + '</font>\n' +
    '>附件链接：[](' + attachmentContents.join('') + ')\n' +
    '>解决结果：<font color=\'warning\'>' + resolution.name + '</font>';
  if(contents !== undefined && contents !== null){
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
 * jira经办人变更
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('issue_updated', async function (event) {
     // issue: 事件
     // changelog: 改动日志
     const { timestamp, issue, changelog } = event.payload;
     console.log('changelog', issue, changelog)

     // issueId: 问题id
     let issueId = issue.key;
     // project: 项目相关
     // creator: 创建人
     // summary: 问题概要
     // description: 问题描述
     // priority: 优先级
     // assignee: 经办人
     // attachment: 附件
     // aggregatetimeestimate: 初始预估时间
     // aggregateprogress
     // resolution：解决结果
     // 1 任务准备
     // 10103 修改代码
     // 10106 bug打回
     const { project, creator, summary, description, priority, assignee, attachment, aggregatetimeestimate, aggregateprogress, resolution, status, comment, issuetype } = issue.fields;
     // key: 项目key
     // name: 项目名
     let { key, name } = project;
     // chatid: 群聊id
     let chatid = await utils.getJiraChatId(key, issuetype.id);
     // 问题链接
     let link = issue.self;
     // issue状态
     // assignee 经办人改变
     // status 状态改变，如任务准备->修改代码
     // 修改代码->单元测试
     // 验证修改->修复bug
     let operatorStatus = changelog.items[0].field;
     // 前经办人
     let bfOperator = changelog.items[0].fromString;
     let bfrom = changelog.items[0].from;
     // 目前经办人
     let afOperator = changelog.items[0].toString;
     let afTo = changelog.items[0].to;

     let contents;
     const links = `http://192.168.214.112:7070/jira/browse/${issueId}`;
     switch(operatorStatus){
       case 'assignee': {
         if(changelog.items.length > 1){
           if(changelog.items[1].from === '1' && changelog.items[1].to === '10106'){
             contents = '问题概要：[' + summary + '](' + links + ')\n' +
               '>当前经办人：**' + assignee.displayName + '**\n' +
               '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
               '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
               '>详情：<font color=\'info\'>' + bfOperator + '</font>打回了问题\n' +
               '>请<font color=\'info\'>' + afOperator + '</font>尽快处理，选择`重启`或`关闭`按钮';
           }else if(changelog.items[1].from === '10101' && changelog.items[1].to === '10104'){
             contents = '问题概要：[' + summary + '](' + links + ')\n' +
               '>当前经办人：**' + assignee.displayName + '**\n' +
               '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
               '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
               '>详情：<font color=\'info\'>' + bfOperator + '</font>已经修复该问题\n' +
               '>请<font color=\'info\'>' + afOperator + '</font>尽快验证问题';
           }else if(changelog.items[1].from === '10104' && changelog.items[1].to === '1'){
             let issueComment = comment !== null && comment.comments.length > 0 ? comment.comments[comment.comments.length - 1].body : '无';
             contents = '问题概要：[' + summary + '](' + links + ')\n' +
               '>当前经办人：**' + assignee.displayName + '**\n' +
               '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
               '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
               '>详情：<font color=\'info\'>' + bfOperator + '</font>认为该问题尚未修复\n' +
               '>修改建议：' + issueComment + '\n' +
               '>请<font color=\'info\'>' + afOperator + '</font>尽快修复问题，然后提交验证';
           }else if(changelog.items[1].from === '3' && changelog.items[1].to === '10101'){
             contents = '问题概要：[' + summary + '](' + links + ')\n' +
               '>当前经办人：**' + assignee.displayName + '**\n' +
               '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
               '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
               '>详情：<font color=\'info\'>' + bfOperator + '</font>已完成代码编写\n' +
               '>请<font color=\'info\'>' + afOperator + '</font>尽快测试';
           }else if(changelog.items[1].from === '10101' && changelog.items[1].to === '3'){
             let issueComment = comment !== null && comment.comments.length > 0 ? comment.comments[comment.comments.length - 1].body : '无';
             contents = '问题概要：[' + summary + '](' + links + ')\n' +
               '>当前经办人：**' + assignee.displayName + '**\n' +
               '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
               '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
               '>详情：<font color=\'info\'>' + bfOperator + '</font>认为页面尚未完成编写\n' +
               '>修改建议：' + issueComment + '\n' +
               '>请<font color=\'info\'>' + afOperator + '</font>尽快完成编写';
           }
         }
         else{
             if(bfOperator === null){
                 contents = '问题概要：[' + summary + '](' + links + ')\n' +
                     '>当前经办人：**' + assignee.displayName + '**\n' +
                     '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
                     '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
                     '>详情：经办人改为<font color=\'info\'>' + afOperator + '</font>\n' +
                     '>请<font color=\'info\'>' + afOperator + '</font>尽快处理';
             }else{
                 contents = '问题概要：[' + summary + '](' + links + ')\n' +
                     '>当前经办人：**' + assignee.displayName + '**\n' +
                     '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
                     '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
                     '>详情：经办人由<font color=\'info\'>' + bfOperator + '</font>改为<font color=\'info\'>' + afOperator + '</font>\n' +
                     '>请<font color=\'info\'>' + afOperator + '</font>尽快处理';
             }
         }
         break;
       }
       case 'status':{
         if(bfrom === '10106' && afTo === '10107'){
           contents = '问题概要：[' + summary + '](' + links + ')\n' +
             '>当前经办人：**' + assignee.displayName + '**\n' +
             '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
             '><font color=\'info\'>' + assignee.displayName + '</font>关闭了bug>';
           break;
         }else if(bfrom === '10104' && afTo === '1'){
           contents = '问题概要：[' + summary + '](' + links + ')\n' +
             '>当前经办人：**' + assignee.displayName + '**\n' +
             '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
             '><font color=\'info\'>' + assignee.displayName + '</font><font color=\'warning\'>验证该问题尚未修改，请重新指定经办人</font>';
         }else if(afTo === '10106'){
           contents = '问题概要：[' + summary + '](' + links + ')\n' +
             '>当前经办人：**' + assignee.displayName + '**\n' +
             '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
             '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
             '>详情：<font color=\'info\'>' + assignee.displayName + '</font>打回了问题';
         }
         // else if(afTo === '10101'){
         //   contents = '问题概要：[' + summary + '](' + links + ')\n' +
         //     '>当前经办人：**' + assignee.displayName + '**\n' +
         //     '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
         //     '>issueId：<font color=\'info\'>' + issueId + '</font>\n' +
         //     '>请<font color=\'info\'>' + assignee.displayName + '</font>修改经办人为其他';
         // }
         break;
       }
       case 'resolution':{
         switch(afTo){
           case '10000':{
             contents = '问题概要：[' + summary + '](' + links + ')\n' +
               '>当前经办人：**' + assignee.displayName + '**\n' +
               '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
               '>初始预估时间：<font color=\'comment\'>' + aggregatetimeestimate / 60 + '</font>h\n' +
               // '>解决结果：<font color=\'comment\'>' + resolution !== null ? resolution.name : '未完成' + '</font>\n' +
               '>由<font color=\'info\'>' + creator.displayName + '</font>创建的问题, issueId：<font color=\'info\'>' + issueId + '</font>\n' +
               '问题已经被修复';
           }
         }
         break;
       }
     }
    if(contents !== undefined && contents !== null){
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
 * jira删除问题
 * user登录人信息
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('issue_deleted', async function (event) {
  const { timestamp, user, issue, changelog } = event.payload;
  // console.log(event.payload, issue, changelog)
  // issueId: 问题id
  let issueId = issue.key;
  // project: 项目相关
  // creator: 创建人
  // summary: 问题概要
  // description: 问题描述
  // priority: 优先级
  // assignee: 经办人
  // attachment: 附件
  // aggregatetimeestimate: 初始预估时间
  // aggregateprogress
  // resolution：解决结果
  // status: 状态改变：修复bug->完成
  const { project, creator, summary, description, priority, assignee, attachment, aggregatetimeestimate, aggregateprogress, resolution, status, issuetype } = issue.fields;
  // key: 项目key
  // name: 项目名
  const { key, name } = project;
  // chatid: 群聊id
  let chatid = await utils.getJiraChatId(key, issuetype.id);
  let attachmentContents = attachment.reduce((total, item, index) => {
    return [...total, item.content];
  }, [])
  const links = `http://192.168.214.112:7070/jira/browse/${issueId}`;
  let contents = '问题概要：[' + summary + '](' + links + ')\n' +
    '>当前经办人：<font color=\'warning\'>' + assignee.displayName + '</font>\n' +
    '>时间：<font color=\'comment\'>' + moment.unix(timestamp).format('YYYY-MM-DD hh:mm:ss') + '</font>\n' +
    '><font color=\'info\'>' + user.displayName + '</font>已经删了问题, issueId：<font color=\'info\'>' + issueId + '</font>\n';
  if(contents !== undefined && contents !== null){
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
 * jira经办人变更
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
WebhookHandler.on('worklog changed', async function (event) {
  const { issue, changelog } = event.payload;
  console.log('worklog changed', event.payload.issue.fields)
  let issueId = issue.key;

})
