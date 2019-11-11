import Redis from 'ioredis';

const redis = new Redis({
  port: '6379',
  host: '192.168.214.134',
  db: 1,
  password: '123456',
})


const pub = new Redis({
  port: '6379',
  host: '192.168.214.134',
  db: 1,
  password: '123456',
});

pub.once('connect', () => {
  pub.select(1, (err) => {
    if(err) process.exit(4);
    pub.subscribe("foo", function() {
        //... 订阅频道成功
        console.log('订阅频道成功');
    })
  })
})

export default redis;
