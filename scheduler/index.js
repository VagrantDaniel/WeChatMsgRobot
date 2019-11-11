import api from '../store/WechatAPI';
import * as utils from "../static/util";

const schedule  = require('node-schedule');
const rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [1];
rule.hour = 2;
rule.minute = 0;


export const scheduleCronstyle = ()=> {
    let chatArr = [];
    const sendWeeklyInfo =  async () => {
        let cb = await utils.readText('/data/weeklyInfo.json');
        if(cb.length > 0){
            cb = JSON.parse(cb);
        }
        return {
            code: 200,
            msg: 'ok',
            result: cb,
        }
    }
    sendWeeklyInfo().then((data) => {
        if(data.msg === 'ok' && data.result.length > 0){
            chatArr = data.result.reduce((total, item) => {
                return [...total, item.chatid]
            }, [])
        }
    });
    schedule.scheduleJob(rule, async () => {
        chatArr.forEach(async (chatid) => {
            let message = {
                "chatid": chatid,
                "msgtype":"text",
                "text":{
                    "content" : "提醒大家交周报啦！"
                },
                "safe":0
            };
            await api.ensureAccessToken();
            api._appchatSend(chatid, message);
        })
    });
}
