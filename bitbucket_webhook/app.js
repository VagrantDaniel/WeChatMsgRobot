'use strict'
// var createHandler = require('node-bitbucket-webhook')
var createHandler = require('./lib/createHandler')
// var handler = createHandler([ // 多个仓库
//   { path: '/webhook1' },
//   { path: '/webhook2' }
// ])
// var handler = createHandler({ path: '/webhook1' }) // 单个仓库
var handler = createHandler({ path: '/' }) // 单个仓库

module.exports =  handler;
