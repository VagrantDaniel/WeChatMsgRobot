import BitbucketWebhookHandler from '../koa-bitbucket-webhook-handler/app';

const WebhookHandler = new BitbucketWebhookHandler([ // 多个仓库
  { path: '/bitbucket' },
  { path: '/jira' },
  { path: '/YApi' },
]);

export default WebhookHandler;
