### 前端管理页面

![](https://user-gold-cdn.xitu.io/2019/11/11/16e59c6a82d2d236?w=1462&h=761&f=png&s=58447)
### 后台
![项目框架](https://user-gold-cdn.xitu.io/2019/11/11/16e59abd31b9f53a?w=319&h=742&f=png&s=38257)
> bitbucket_webhook————bitbucket钩子<br/>
> koa-bitbucket-webhook-handler————koa中间件：bitbucket钩子<br/>
> wechat_enterprise_api————企业微信API封装<br/>
> controller————业务逻辑，对数据重新封装<br/>
> provider————消息推送文件<br/>
> route-decorators————自定义的路由装饰器 <br/>
> scheduler————定时器<br/>
> service————细分controller层的业务逻辑，主要处理企业微信API相关逻辑<br/>
> static<br/>
>> data————群信息json文件，用于持久化存储<br/>
>> config.js————企业微信appid、appsecret、address_secret、agentid<br/>
>> util.js————读写文件、判断是否跨域函数等

> store————redis、企业微信api、消息钩子<br/>
>> redis.js————定义全局redis模块<br/>
>> webhookHandler————定义全局消息钩子仓库<br/>
>> WebchatAPI————定义企业微信消息模块<br/>

> app.js————入口文件

### 技术栈
- WebHook消息钩子<br/>

![https://confluence.atlassian.com/bitbucketserver/event-payload-938025882.html#Eventpayload-httpheadersHTTPheaders](https://user-gold-cdn.xitu.io/2019/11/11/16e59c8c11c78e70?w=780&h=129&f=png&s=17518)
```
当有一个带有事件的Webhook时，只要该事件发生，Bitbucket就会将事件请求发送到该Webhook的服务器URL。
```
所以当配好要被发送到的服务器地址后，事件流如发起合并：pr:opened，push事件：repo:refs_changed，审核人merge操作：pr:merge，needs_work事件：pr:reviewer:needs_work等等都会有对应的json数据返回，然后就可以获取想要的有用信息。
- EventEmitter————发布订阅模式
```
ES5写法
var EventEmitter = require('events').EventEmitter
function create(options) {
  // 定义handler函数，指向EventEmitter的原型，继承EventEmitter的变量和方法
  handler.__proto__ = EventEmitter.prototype
  // 改变this指针指向handler函数
  EventEmitter.call(handler)

  return handler

  function handler(req, res, callback) {
    // ...do something
  }
}
```
```
ES6写法
const _events = require('events');
class BitbucketWebhookHandler extends _events.EventEmitter {
  constructor(ops) {
    super();
    this.ops = ops;
  }
}
export default BitbucketWebhookHandler;
```
EventEmitter 的核心就是事件触发与事件监听器功能的封装。<br/>
- addListener(event, listener)
为指定事件添加一个监听器到监听器数组的尾部。
- 	on(event, listener)
为指定事件注册一个监听器，接受一个字符串 event 和一个回调函数。
- 	once(event, listener)
为指定事件注册一个单次监听器，即 监听器最多只会触发一次，触发后立刻解除该监听器。
- 	removeListener(event, listener)
移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器。

它接受两个参数，第一个是事件名称，第二个是回调函数名称。
- 	removeAllListeners([event])
移除所有事件的所有监听器， 如果指定事件，则移除指定事件的所有监听器。
- emit(event, [arg1], [arg2], [...])
按监听器的顺序执行执行每个监听器，如果事件有注册监听返回 true，否则返回 false。<br/>
在平时日常使用中emit和on就足够够用。<br/>
为什么要重写EventEmitter方法呢？<br/>
其实EventEmitter只是Node中的一个很小的工具类，它并不知道你要使用它做什么，你需要什么样的事件发送和接收，这些都需要你自己去实现，它就完成分发派送的工作就好，就像我们的快递员一样。
这就为它本身提供了非常大的功能延展性和可想象空间。
- Redis<br/>
Redis是一个很好的持久化存储工具，支持(key, value)的存储处理方式。在项目中具体使用场景是在代码审核时如果不同意合并要给出评审意见，但是评审意见和不同意操作分为两步进行，是两个事件，所以需要把评审意见暂时储存起来，当触发拒绝事件时把评审建议也展示出来。<br/>
还有一个使用场景我并未实现，就是Redis的键空间机制，它使用的也是订阅、发布机制，通过一段时间监听某一个事件，然后返回一个回调函数。我主要是想如果未审核的代码在半小时内未被合并，就再次提醒审核人。
```
使用方法：
赋值：redis.multi() //开启多事务
    .set(key, value)
    .exec((err) => {
        return;
    })
取值：redis.get(key).then((res) => { ... } )
删除key: redis.del(key)
```
- 定时器<br/>
定时器使用node非常有名的node_schedule包
```
const schedule  = require('node-schedule');
const rule = new schedule.RecurrenceRule(); // 设置定时器规则

rule.dayOfWeek = [1];
rule.hour = 2;
rule.minute = 0;
schedule.scheduleJob(rule, () => {
    // ...do something
}
```
***
最后附上git地址，欢迎star啊 §[开心]§<br/>
[Github](https://github.com/OnPure/WeChatMsgRobot)
