import { EventEmitter } from 'events';

class BitbucketWebhookHandler extends EventEmitter {
  constructor(ops) {
    super();

    ;['path'].map((key) => {
      if(![ops[key]]) {
        throw new Error('BitbucketWebhookHandler require path')
      }
    })
    this.ops = ops;
  }

  middleware() {
     const self = this;
     return function* middleware (next) {
       if(this.request.method == 'POST' || this.request.method == 'post' && this.request.get('x-request-id') && this.request.get('x-event-key')){
         if(this.request.url !== self.ops.path) return yield next;

         // console.log('req', req);

         const r_uuid = this.request.get('x-request-id');
         // const h_uuid = this.request.get('x-hook-uuid');
         var event = this.request.get('x-event-key');

         this.assert(r_uuid, 400, 'No X-REQUEST-ID found on request');
         this.assert(event, 400, 'No X-EVENT-KEY found on request');

         this.response.body = { ok: true };
         event = (event === 'repo:refs_changed') ? event.replace(event, 'push') : event;
         // ctx.request
         if(event){
           const emitData = {
             event: event,
             id: r_uuid,
             payload: this.request.body,
             protocol: this.request.protocol,
             host: this.request.headers['host'],
             url: this.request.url
           };
           // console.log('event', event)
           self.emit(event, emitData);
           self.emit('*', emitData);
         }
       }
       yield next;
     }
  }
}
export default BitbucketWebhookHandler;
