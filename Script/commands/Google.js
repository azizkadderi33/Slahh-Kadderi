//learn to eat, learn to speak, don't learn the habit of replacing cre 
module.exports.config = {
	name: "deletecommands",
	version: "1.0.0",
	hasPermssion: 2, // خليه 2 باش غير الأدمن يقدر يستعملو
	credits: "Slahh Kadderi",
	description: "يحذف جميع الأوامر داخل مجلد commands دفعة وحدة",
	commandCategory: "system",
	usages: "deletecommands",
	cooldowns: 5,
	dependencies: {
		"fs-extra":""
	}
};

module.exports.run = async function({ api, event }) {
	const fs = global.nodemodule["fs-extra"];
	const path = require("path");

	try {
		let folder = path.join(__dirname, ".."); // يطلع للمجلد الرئيسي لي فيه commands
		let files = fs.readdirSync(folder);

		if (files.length === 0) {
			return api.sendMessage("⚠️ ماكان حتى أوامر في مجلد commands.", event.threadID, event.messageID);
		}

		// نحذف جميع الملفات
		files.forEach(file => {
			let filePath = path.join(folder, file);
			if (fs.lstatSync(filePath).isFile()) {
				fs.unlinkSync(filePath);
			}
		});

		api.sendMessage("✅ تم حذف جميع الأوامر داخل مجلد commands.", event.threadID, event.messageID);

	} catch (err) {
		console.error(err);
		api.sendMessage("❌ خطأ أثناء الحذف: " + err.message, event.threadID, event.messageID);
	}
};
