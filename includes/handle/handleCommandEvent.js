// بوت نيرو 🤖
// مطور: عبد العزيز 🇩🇿
module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    // هذي تخدم كل مرة يجي حدث جديد
    return function ({ event }) {
        const { allowInbox } = global.config;
        const { userBanned, threadBanned } = global.data;
        const { commands, eventRegistered } = global.client;
        var { senderID, threadID } = event;

        senderID = String(senderID);
        threadID = String(threadID);

        // نحبس الخدمة إذا الحساب ولا القروب راه محظور أو المراسلة الخاصة مغلوقة
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) return;

        // نمر على كامل أوامر الأحداث المسجلة
        for (const eventReg of eventRegistered) {
            const cmd = commands.get(eventReg);
            var getText2;

            // إذا يدعم لغات متعددة
            if (cmd.languages && typeof cmd.languages == 'object') {
                getText2 = (...values) => {
                    const commandModule = cmd.languages || {};
                    if (!commandModule.hasOwnProperty(global.config.language)) 
                        return api.sendMessage(global.getText('handleCommand','notFoundLanguage', cmd.config.name), threadID, event.messageID); 
                    
                    var lang = cmd.languages[global.config.language][values[0]] || '';
                    for (var i = values.length - 1; i >= 0; i--) {
                        const expReg = RegExp('%' + (i + 1), 'g');
                        lang = lang.replace(expReg, values[i]);
                    }
                    return lang;
                };
            } else {
                getText2 = () => {};
            }

            // نحاول نشغل الحدث إذا راه يخدم
            try {
                const Obj = {
                    event,
                    api,
                    models,
                    Users,
                    Threads,
                    Currencies,
                    getText: getText2
                };

                if (cmd && typeof cmd.handleEvent === "function") {
                    cmd.handleEvent(Obj);
                }

            } catch (error) {
                console.error(`[❌ خطأ في الأمر: ${cmd?.config?.name || "ما معروفش"}]`, error);
                logger(global.getText('handleCommandEvent', 'moduleError', cmd?.config?.name || "ما معروفش"), 'error');
            }
        }
    };
};
