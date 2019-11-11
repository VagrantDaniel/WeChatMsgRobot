/**
 * Bitbucket Webhooks handler
*/

var EventEmitter = require('events').EventEmitter
var bl = require('bl')

function isObject(obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}

function findHandler(url, arr) {
  var ret = arr[0]
  for (var i = 0; i < arr.length; i++) {
    if (url.split('?').shift() === arr[i].path)
      ret = arr[i]
  }
  return ret
}

function create(options) {
  // make it an EventEmitter, sort of
  handler.__proto__ = EventEmitter.prototype
  EventEmitter.call(handler)

  return handler

  function handler(req, res, callback) {
    console.log(res.body)
    function hasError(msg) {
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: msg }))

      var err = new Error(msg)
      handler.emit('error', err, req)
      callback(err)
    }

    function checkType(options) {
      if (!isObject(options))
          throw new TypeError('must provide an options object')

      if (typeof options.path !== 'string')
        throw new TypeError('must provide a \'path\' option')
    }

    var method = req.method.toLowerCase()
    if (method != 'post') {
      return hasError('http request must use post method')
    }

    var currentOptions
    if (Array.isArray(options)) {
      currentOptions = findHandler(req.url, options)
    } else {
      currentOptions = options
    }

    checkType(currentOptions)

    if (req.url.split('?').shift() !== currentOptions.path)
      return callback()
    var r_uuid = req.headers['x-request-id']
    var h_uuid = req.headers['x-hook-uuid']

    var event = req.headers['x-event-key']

    if (!r_uuid)
      return hasError('No X-Request-UUID found on request' + req)

    if (!event)
      return hasError('No X-Event-Key found on request')

    // if (!h_uuid)
    //   return hasError('No X-Hook-UUID found on request')

    event = event.replace('repo:','')

    req.pipe(bl(function(err, data) {
      if (err)
        return hasError(err.message)

      var obj

      try {
        obj = JSON.parse(data.toString())
      } catch (e) {
        return hasError(e)
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end('{"ok":true}')

      event = (event === 'refs_changed') ? event.replace(event, 'push') : event;
      var emitData = {
        event: event,
        payload: obj,
        protocol: req.protocol,
        host: req.headers['host'],
        url: req.url,
        path: currentOptions.path
      }
      console.log(event);
      handler.emit(event, emitData)
      handler.emit('*', emitData)
    }))
  }
}

module.exports = create
