import Koa from 'koa';
import convert from 'koa-convert';
const app = new Koa();
import koaBody from 'koa-body';
import BitbucketWebhookHandler from './koa-bitbucket-webhook-handler/app';

const bitbucketWebhookHandler = new BitbucketWebhookHandler({
  path: '/',
});

/**
 * 错误处理
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
bitbucketWebhookHandler.on('error', function (err) {
 console.error('Error:', err.message)
})

/**
 * 发起合并请求
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
bitbucketWebhookHandler.on('pr:opened', async function(event){
  console.log('Received a pr:refs_changed event', event);
}

/**
 * commit的时候会触发
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
bitbucketWebhookHandler.on('pr:merged', async function(event){
  console.log('Received a pr:reviewer:merged event', event);
}

/**
 * 管理员commit的时候会触发
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
bitbucketWebhookHandler.on('pr:reviewer:merged', async function(event) {
  console.log('Received a pr:reviewer:merged event', event);
}

/**
 * 修改
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
bitbucketWebhookHandler.on('pr:reviewer:needs_work', async function(event) {
  console.log('Received a pr:reviewer:needs_work event', event);
}

/**
 * 不同意
 */
bitbucketWebhookHandler.on('pr:reviewer:unapproved', async function(event) {
  console.log('Received a pr:reviewer:unapproved event', event);
}

/**
 * push事件
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
bitbucketWebhookHandler.on('push', async function (event) {
  console.log('Received a push event', event);
}

/**
 * 使用中间件，因为是post请求，所以需要koa-body
 */
app.use(koaBody());
app.use(convert(bitbucketWebhookHandler.middleware()));

app.listen((process.env.PORT || 7780));
