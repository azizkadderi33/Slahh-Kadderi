module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment");
    const fs = require("fs");

    return function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Africa/Algiers").format("HH:mm:ss L");
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        var { senderID, threadID, type, attachments } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        // حماية من الرسائل المحظورة
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox === false && senderID == threadID)) return;

        // حذف الصور والفيديوهات تلقائيًا
        if (attachments && attachments.length > 0) {
            for (const item of attachments) {
                const type = item.type;
                if (type === 'photo' || type === 'video') {
                    return api.sendMessage("❌ يمنع إرسال الصور أو الفيديوهات في هذا الشات.\n⛔ تم الحذف بواسطة نيرو 🔥", threadID, () => {
                        api.unsendMessage(event.messageID);
                    });
                }
            }
        }

        // تفعيل حدث تغيير صورة المجموعة
        if (event.type == "change_thread_image") event.logMessageType = "change_thread_image";

        for (const [key, value] of events.entries()) {
            if (value.config.eventType.includes(event.logMessageType)) {
                const eventRun = events.get(key);
                try {
                    const Obj = {
                        api,
                        event,
                        models,
                        Users,
                        Threads,
                        Currencies
                    };
                    eventRun.run(Obj);
                    if (DeveloperMode === true) {
                        logger(global.getText('handleEvent', 'executeEvent', time, eventRun.config.name, threadID, Date.now() - timeStart), '[ Event ]');
                    }
                } catch (error) {
                    logger(global.getText('handleEvent', 'eventError', eventRun.config.name, JSON.stringify(error)), "error");
                }
            }
        }
        return;
    };
};

// بوت نيرو ☠️
// مطور: عبد العزيز
