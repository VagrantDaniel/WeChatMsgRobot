'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const _events = require('events');

class BitbucketWebhookHandler extends _events.EventEmitter {
  constructor(ops) {
    super();

    ;['path'].map(key => {
      if (![ops[key]]) {
        throw new Error('BitbucketWebhookHandler require path');
      }
    });
    this.ops = ops;
  }

  middleware() {
    const self = this;
    return function* middleware(next) {
      console.log(typeof this.request.get('x-request-id'), this.request.get('x-request-id') === '', this.request.get('x-request-id') === null, this.request.get('x-event-key'), this.request.url)
      if(this.request.method.toUpperCase() == 'POST' && this.request.body.YApiEvent !== null && this.request.body.YApiEvent != undefined) {
        let flag = self.ops.find((option) => option.path === this.request.url)
        if(!flag) return yield next;
        let event = this.request.body.YApiEvent;

        this.assert(event, 400, 'No YApiEvent found on request');

        this.response.body = { ok: true };

        // console.log('event', this.request.body);
        if(event) {
          const emitData = {
            event: event,
            payload: this.request.body,
            protocol: this.request.protocol,
            host: this.request.headers['host'],
            url: this.request.url
          }
          self.emit(event, emitData);
          self.emit('*', emitData);
        }
        try{
          yield next;
        }catch(err){
          console.log(err)
          // ctx.status = err.status || 500;
          // ctx.body = err.message;
          // ctx.app.emit("error", err, ctx);
        }
      }
      if((this.request.method == 'POST' || this.request.method == 'post') && this.request.body.webhookEvent !== null && this.request.body.webhookEvent != undefined) {
        let flag = self.ops.find((option) => option.path === this.request.url.split('?')[0].toString())
        if(!flag) return yield next;
        var event = this.request.body.webhookEvent;

        this.assert(event, 400, 'No WebhookEvent found on request');

        this.response.body = { ok: true };

        event = event.replace('jira:', '');
        // console.log('event', this.request.body);
        if(event) {
          const emitData = {
            event: event,
            payload: this.request.body,
            protocol: this.request.protocol,
            host: this.request.headers['host'],
            url: this.request.url
          }
          self.emit(event, emitData);
          self.emit('*', emitData);
        }
        try{
          yield next;
        }catch(err){
          console.log(err)
          // ctx.status = err.status || 500;
          // ctx.body = err.message;
          // ctx.app.emit("error", err, ctx);
        }
      }
      if (this.request.method == 'POST' || this.request.method == 'post' && this.request.get('x-request-id') !== undefined && this.request.get('x-event-key') !== undefined
          && this.request.get('x-request-id') !== '' && this.request.get('x-event-key') !== '') {
        let flag = self.ops.find((option) => option.path === this.request.url)
        if(!flag) return yield next;
        const r_uuid = this.request.get('x-request-id');
        // const h_uuid = this.request.get('x-hook-uuid');
        var event = this.request.get('x-event-key');

        this.assert(r_uuid, 400, 'No X-REQUEST-ID found on request');
        this.assert(event, 400, 'No X-EVENT-KEY found on request');


        this.response.body = { ok: true };
        event = event === 'repo:refs_changed' ? event.replace(event, 'push') : event;

        if (event) {
          const emitData = {
            event: event,
            id: r_uuid,
            payload: this.request.body,
            protocol: this.request.protocol,
            host: this.request.headers['host'],
            url: this.request.url
          };
          self.emit(event, emitData);
          self.emit('*', emitData);
        }
        try{
          yield next;
        }catch(err){
          console.log(err)
          // ctx.status = err.status || 500;
          // ctx.body = err.message;
          // ctx.app.emit("error", err, ctx);
        }
      }
      try{
        yield next;
      }catch(err){
        console.log(err)
        // ctx.status = err.status || 500;
        // ctx.body = err.message;
        // ctx.app.emit("error", err, ctx);
      }
    };
  }
}
exports.default = BitbucketWebhookHandler;
