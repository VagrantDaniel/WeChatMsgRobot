import moment from 'moment';
import WebhookHandler from '../store/webhookHander';
import api from '../store/WechatAPI';
import * as utils from '../static/util';

/**
 * YApi新建接口
 * @type {[type]}
 */
WebhookHandler.on('yapi_interface_add', async function (event) {
    console.log('yapi_interface_add', event.payload)
})

/**
  * YApi更新接口
  * @type {[type]}
  */
WebhookHandler.on('yapi_interface_update', async function (event) {
  console.log('yapi_interface_update', event.payload)
  /**
   * project_id 项目id
   * title 接口名称
   * beHead 后端负责人信息
   * gqlOpera 接口请求方式(query / mutation)
   * project_name 项目名称
   * curUserName 操作者
   * up_time 时间
   * link 接口链接
   * diff 更新的内容
   * status 更新的状态
   */
  const { link, current, curUserName,  } = event.payload;
  const { project_id, project_name, up_time, interfaceUser, title, gqlOpera, beHead } = current;
  let chatid = await utils.getYApiChatId(project_id);
  let interfaceUserArr = [];
  interfaceUser.forEach((item) => {
      interfaceUserArr.push(item.username);
  })
  let contents = '时间：<font color=\'comment\'>' + moment.unix(up_time).format('YYYY-MM-DD hh:mm:ss') + '</font>' +
      '\n项目：<font color=\'comment\'>' + project_name + '</font>'+
      '\n接口信息如下：'+
      '\n接口名：<font color=\'info\'>'+title+'</font>' +
      '\ngraphql请求类型：<font color=\'info\'>' + gqlOpera +
      '\n</font>后端负责人：<font color=\'info\'>' + beHead.username + '</font>' +
      '\n<font color=\'info\'>' + curUserName + '</font>修改了接口'+
      '\n请<font color=\'info\'>' + interfaceUserArr.join(',') + '</font>尽快查看接口' +
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
})

/**
  * YApi删除接口
  * @type {[type]}
  */
WebhookHandler.on('yapi_interface_del', async function (event) {
  console.log('yapi_interface_del', event.payload)
  /**
   * title 接口名称
   * project_name 项目名称
   * curUserName 操作者
   * up_time 时间
   */
  const { project_id, project_name, title, up_time, curUserName } = event.payload;
  let chatid = await utils.getYApiChatId(project_id);
  let contents = '时间：<font color=\'comment\'>' + moment.unix(up_time).format('YYYY-MM-DD hh:mm:ss') + '</font>' +
    '\n项目：<font color=\'info\'>' + project_name + '</font>' +
    '\n接口<font color=\'info\'>' + title + '</font>被<font color=\'info\'>' + curUserName + '</font>删掉了';
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
