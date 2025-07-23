module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "عبد العزيز - Algeria 🇩🇿",
    description: "إشعار دخول أعضاء أو البوت برسالة فقط"
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;

    // إذا دخل البوت للمجموعة
    const isBotJoin = event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID());
    if (isBotJoin) {
        const botName = global.config.BOTNAME || "BOT";
        await api.changeNickname(`[ ${global.config.PREFIX} ] • ${botName}`, threadID, api.getCurrentUserID());

        const message = 
`🔹 تم إضافة البوت إلى المجموعة
🤖 إسمي: ${botName}
📌 لعرض الأوامر: ${global.config.PREFIX}help
شكراً لكم على الثقة 💙`;

        return api.sendMessage(message, threadID);
    }

    // إذا دخل عضو جديد
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};

        let mentions = [];
        let nameArray = [];
        let memberCount = threadInfo.participantIDs.length;

        for (const participant of event.logMessageData.addedParticipants) {
            nameArray.push(participant.fullName);
            mentions.push({ tag: participant.fullName, id: participant.userFbId });
        }

        let customMsg = threadData.customJoin || 
`🌟 مرحباً {name}
أنت/أنتم العضو رقم {count} في:
📍 {threadName}
نتمنى لك/لكم وقتاً ممتعاً معنا!`;

        const welcomeMsg = customMsg
            .replace(/\{name}/g, nameArray.join(', '))
            .replace(/\{count}/g, memberCount)
            .replace(/\{threadName}/g, threadInfo.threadName);

        const formPush = {
            body: welcomeMsg,
            mentions
        };

        return api.sendMessage(formPush, threadID);
    } catch (err) {
        console.error("joinNoti error:", err);
    }
};
