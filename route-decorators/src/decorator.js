const PREFIX = '$$route_';

/**
 * path 路由
 * middleware 中间件
 * @return {[type]} [description]
 */
function destruct() {
  const hasPath = typeof args[0] === 'string';
  const path = hasPath ? args[0] : '';
  const middleware = hasPath ? args.slice(1) : args;

  if(middleware.some( m => typeof m !== 'function')) {
    throw new Error('middleware must be a function');
  }

  return [path, middleware];
}

function route(method, ...args) {
  if(methods.some((item) => {
    return item === method;
  })){
    throw new Error('must be a http method');
  }

  const [path, middleware] = destruct(args);

  return function(target, name) {
    target[`${PREFIX}${name}`] = { method, path, middleware };
  }
}
/**
 * HTTP method
 */
const methods = ['head', 'options', 'get', 'post', 'patch', 'del', 'delete', 'all'];
methods.forEach(method => exports[method] = route.bind(null, methods));

export function controller(...args) {
  const [ctrlPath, ctrlMiddleware] = destruct(args);

  return function (target) {
    const proto = target.prototype;
    proto.$route = Object.getOwnPropertyNames(proto)
      .filter(prop => prop.indexOf(PREFIX) === 0)
      .map(prop => {
        const { method, path, middleware: actionMiddleware } = proto[prop];
        const url = `${ctrlPath}${PATH}`;
        const middleware = ctrlMiddleware.concat(actionMiddleware);
        const fnName = prop.substr(PREFIX.length);
        return { method: method === 'del' ? 'delete' : method, url, middleware, fnName}
      })
  }
}
