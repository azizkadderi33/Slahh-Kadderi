// سكريبت تسجيل تلقائي للقروبات والمستخدمين
// 🧠 اسم البوت: نيرو
// 👨‍💻 المطور: عبد العزيز 🇩🇿

module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    return async function ({ event }) {
        const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data; 
        const { autoCreateDB } = global.config;

        if (!autoCreateDB) return;

        let { senderID, threadID, attachments } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        try {
            // ❌ نحذف الصور والفيديوهات مباشرة
            if (attachments && attachments.length > 0) {
                for (const file of attachments) {
                    if (["photo", "video"].includes(file.type)) {
                        return; // نحبسو الخدمة مباشرة لو كانت صورة أو فيديو
                    }
                }
            }

            // ✅ تسجيل القروب إذا مش موجود
            if (!allThreadID.includes(threadID) && event.isGroup) {
                const threadIn4 = await Threads.getInfo(threadID);
                const dataThread = {
                    threadName: threadIn4.threadName,
                    adminIDs: threadIn4.adminIDs,
                    nicknames: threadIn4.nicknames
                };

                allThreadID.push(threadID);
                threadInfo.set(threadID, dataThread);

                await Threads.setData(threadID, {
                    threadInfo: dataThread,
                    data: {}
                });

                // ➕ تسجيل الأعضاء
                for (const user of threadIn4.userInfo) {
                    const userID = String(user.id);
                    userName.set(userID, user.name);

                    try {
                        if (!global.data.allUserID.includes(userID)) {
                            await Users.createData(userID, {
                                name: user.name,
                                data: {}
                            });
                            global.data.allUserID.push(userID);
                            logger(global.getText('handleCreateDatabase', 'newUser', userID), '[ DATABASE ]');
                        } else {
                            await Users.setData(userID, { name: user.name });
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }

                logger(global.getText('handleCreateDatabase', 'newThread', threadID), '[ DATABASE ]');
            }

            // ✅ تسجيل المستخدم إذا مش موجود
            if (!allUserID.includes(senderID) || !userName.has(senderID)) {
                const infoUsers = await Users.getInfo(senderID);
                await Users.createData(senderID, { name: infoUsers.name });
                allUserID.push(senderID);
                userName.set(senderID, infoUsers.name);
                logger(global.getText('handleCreateDatabase', 'newUser', senderID), '[ DATABASE ]');
            }

            // ✅ تسجيل العملة إذا مش موجود
            if (!allCurrenciesID.includes(senderID)) {
                await Currencies.createData(senderID, { data: {} });
                allCurrenciesID.push(senderID);
            }

        } catch (err) {
            console.log(err);
        }
    };
};
