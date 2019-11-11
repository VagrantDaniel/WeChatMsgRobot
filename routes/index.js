import WeChatController from '../controller/WeChatController';

const Router = require('koa-router');
const router = new Router({
    prefix: '/api/v1'
})

module.exports = (app) => {
  router.get('/sendWeChatMembers', WeChatController.sendWeChatMembers);

  router.post('/createChat', WeChatController.createChat);

  router.get('/sendBitbucketInfo', WeChatController.sendBitbucketInfo);

  router.get('/sendJiraInfo', WeChatController.sendJiraInfo);

  router.get('/sendYApiInfo', WeChatController.sendYApiInfo);

  router.post('/updateAppChat', WeChatController.updateAppChat);
  router.get('/', WeChatController.preventRuturn)
  router.post('/', WeChatController.preventRuturn)

  router.get('/sendWeeklyInfo', WeChatController.sendWeeklyInfo);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
