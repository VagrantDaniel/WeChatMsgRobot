# Bitbucket Webhook

> 用于对Bitbucket Cloud Event的返回响应，支持[Bitbucket Cloud](https://confluence.atlassian.com/bitbucket/event-payloads-740262817.html)上所有事件的接收，另外`refs_changed` => `push`

## 从NPM下载包

``` npm
npm i bitbucket_webhook
```

## 使用实例

### 引入包

``` nodeJs
var http = require('http');
var handler = require('bitbucket_webhook');

http.createServer(function (req, res) {
 handler(req, res, function (err) {
   res.statusCode = 404
   res.write = res
   // res.end('no such location')
 })
}).listen(7778)

/**
 * 错误处理
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
handler.on('error', function (err) {
 console.error('Error:', err.message)
})

/**
 * 发起合并请求
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
handler.on('pr:opened', async function(event){
  console.log('Received a pr:refs_changed event', event);
}

/**
 * commit的时候会触发
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
handler.on('pr:merged', async function(event){
  console.log('Received a pr:reviewer:merged event', event);
}

/**
 * 管理员commit的时候会触发
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
handler.on('pr:reviewer:merged', async function(event) {
  console.log('Received a pr:reviewer:merged event', event);
}

/**
 * 修改
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
handler.on('pr:reviewer:needs_work', async function(event) {
  console.log('Received a pr:reviewer:needs_work event', event);
}

/**
 * 不同意
 */
handler.on('pr:reviewer:unapproved', async function(event) {
  console.log('Received a pr:reviewer:unapproved event', event);
}

/**
 * push事件
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
handler.on('push', async function (event) {
  console.log('Received a push event', event);
}
```
