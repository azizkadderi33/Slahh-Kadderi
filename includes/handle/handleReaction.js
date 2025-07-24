module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID } = event;

        // ما كاش ريأكشنات مسجلة
        if (handleReaction.length === 0) return;

        // نلقاو الريأكشن الخاص بالرسالة
        const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
        if (indexOfHandle < 0) return;

        const indexOfMessage = handleReaction[indexOfHandle];
        const handleNeedExec = commands.get(indexOfMessage.name);

        if (!handleNeedExec) {
            return api.sendMessage(global.getText('handleReaction', 'missingValue'), threadID, messageID);
        }

        try {
            let getText2;

            if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
                getText2 = (...value) => {
                    const langPack = handleNeedExec.languages || {};
                    const currentLang = global.config.language;

                    if (!langPack.hasOwnProperty(currentLang)) {
                        return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
                    }

                    let lang = langPack[currentLang][value[0]] || '';
                    for (let i = 1; i < value.length; i++) {
                        const expReg = RegExp('%' + i, 'g');
                        lang = lang.replace(expReg, value[i]);
                    }

                    return lang;
                };
            } else {
                getText2 = () => {};
            }

            const Obj = {
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReaction: indexOfMessage,
                getText: getText2
            };

            handleNeedExec.handleReaction(Obj);
            return;

        } catch (error) {
            return api.sendMessage(global.getText('handleReaction', 'executeError', error), threadID, messageID);
        }
    };
};

// 🛠️ بوت نيرو ☠️
// المطور: عبد العزيز
