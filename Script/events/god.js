module.exports.config = {
	name: "god",
	eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
	version: "1.0.0",
	credits: "عبد العزيز - Algeria 🇩🇿",
	description: "تسجيل إشعارات نشاطات البوت في المجموعات",
	envConfig: {
		enable: true
	}
};

module.exports.run = async function ({ api, event, Threads }) {
	const logger = require("../../utils/log");
	if (!global.configModule[this.config.name].enable) return;

	let task = "";
	const time = new Date().toLocaleString("ar-DZ", { timeZone: "Africa/Algiers" });
	let formReport = 
`📢 إشعار من بوت عبد العزيز
━━━━━━━━━━━━━━
🆔 آيدي المجموعة: ${event.threadID}
🎯 الحدث: {task}
👤 من طرف: ${event.author}
🕒 التوقيت: ${time}
━━━━━━━━━━━━━━`;

	switch (event.logMessageType) {
		case "log:thread-name": {
			const oldName = (await Threads.getData(event.threadID)).name || "لا يوجد اسم قديم";
			const newName = event.logMessageData.name || "لا يوجد اسم جديد";
			task = `تم تغيير اسم المجموعة من: '${oldName}' إلى '${newName}'`;
			await Threads.setData(event.threadID, { name: newName });
			break;
		}
		case "log:subscribe": {
			if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
				task = "تمت إضافة البوت إلى مجموعة جديدة!";
			}
			break;
		}
		case "log:unsubscribe": {
			if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
				task = "تم طرد البوت من المجموعة!";
			}
			break;
		}
		default: break;
	}

	if (!task) return;

	formReport = formReport.replace("{task}", task);
	const god = "100086680386976"; // آيدي المطور لتوصيل الإشعارات

	return api.sendMessage(formReport, god, (error) => {
		if (error) return logger(formReport, "[حدث تم تسجيله]");
	});
};
