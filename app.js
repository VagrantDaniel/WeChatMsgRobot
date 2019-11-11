import Koa from 'koa';
import convert from 'koa-convert';
import HelloController from './test';
const app = new Koa();
import koaBody from 'koa-body';
import bodyParser from 'koa-bodyparser';
import WebhookHandler from './store/webhookHander';
import './provider';
import router from './routes/index';
import { scheduleCronstyle } from './scheduler';

import * as utils from './static/util';
scheduleCronstyle();

WebhookHandler.on('error', async (err) => {
  console.log('Error: ', err);
  throw new Error(err);
})
app.use(koaBody());

app.use(HelloController.routes());
app.use(HelloController.allowedMethods())

app.use(bodyParser());
app.use(convert(WebhookHandler.middleware()));

const ALLOW_ORIGIN = ['192.168.211.11:7780', 'http://localhost:7778'];

app.use(async (ctx, next) => {
  let host = ctx.request.headers['origin'] ? ctx.request.headers['origin'] : ctx.request.headers['Host'];
  if(utils.isOriginAllowed(host, ALLOW_ORIGIN)){
    // host = 'http://' + host;
    ctx.set('Access-Control-Allow-Origin', host);

     //指定服务器允许进行跨域资源访问的请求方法列表，一般用在响应预检请求上
     ctx.set("Access-Control-Allow-Methods", "POST,GET,HEAD,DELETE,PUT");
     //告诉客户端返回数据的MIME的类型，这只是一个标识信息,并不是真正的数据文件的一部分
     // ctx.set("Content-Type", "application/json");
     ctx.set('Access-Control-Max-Age', 3600 * 24);
     //必需。指定服务器允许进行跨域资源访问的请求头列表，一般用在响应预检请求上
     ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");
     ctx.set("Access-Control-Allow-Credentials", true);

  }else{
    ctx.response.body = {
      code: '-2',
      msg: '非法请求'
    }
  }
  await next();

});

app.use(async (ctx, next) => {
  if (ctx.method === 'OPTIONS') {
    ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
    ctx.set('Access-Control-Max-Age', 3600 * 24);
    ctx.body = '';
  }
  await next();
})

/* 错误的集中处理:
 *  log 出来
 *  写入日志
 *  写入数据库
 *   ...
 */
app.on("error", (err, ctx) => {
  console.error("Ooops..\n", err);
});
router(app);

app.listen((process.env.PORT || 7780));
