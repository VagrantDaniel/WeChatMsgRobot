import Router from 'koa-router';

function Controller({ prefix }){
  let router = new Router();
  if (prefix) {
    router.prefix(prefix);
  }
  return function(target) {
    let reqList = Object.getOwnPropertyDescriptors(target.prototype);
    for(let v in reqList) {
      // 排除类的构造方法
      if(v !== 'constructor') {
        let fn = reqList[v].value;
        fn(router);
      }
    }
    return router;
  }
}

const RequestMethod = {
 GET: 'get',
 POST: 'post',
 PUT: 'put',
 DELETE: 'delete'
}

function Request({ url, method }) {
  return function (target, name, descriptor) {
    let fn = descriptor.value;
    descriptor.value = (router) => {
      router[method](url, async(ctx, next) => {
        await fn(ctx, next);
      })
    }
  }
}

@Controller({ prefix: '/hello' })
export default class HelloController {
  @Request({ url: '/', method: RequestMethod.GET })
  async hello(ctx) {
    ctx.body = 'hello world';
  }
}
