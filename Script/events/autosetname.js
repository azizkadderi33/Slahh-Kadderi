module.exports.config = {
	name: "autosetname",
	eventType: ["log:subscribe"],
	version: "1.0.3",
	credits: "عبد العزيز",
	description: "تعيين اسم تلقائي لأي عضو جديد"
};

module.exports.run = async function({ api, event, Users }) {
	const { threadID } = event;
	const { readFileSync, existsSync } = global.nodemodule["fs-extra"];
	const { join } = global.nodemodule["path"];
	const pathData = join(__dirname, "cache", "autosetname.json");

	// نتحقق إذا الملف راه موجود
	if (!existsSync(pathData)) return;

	let dataJson;
	try {
		dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
	} catch (err) {
		console.error("❌ خطأ في قراءة ملف autosetname.json");
		return;
	}

	// نجيبو الآي دي تاع الأعضاء لي دخلو
	const memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId);

	for (let idUser of memJoin) {
		// نلقاو إعدادات القروب
		let thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, nameUser: [] };

		if (thisThread.nameUser.length == 0) continue;

		let setName = thisThread.nameUser[0];
		await new Promise(resolve => setTimeout(resolve, 1000));

		try {
			let nameInfo = await api.getUserInfo(idUser);
			let realName = nameInfo[idUser].name;

			api.changeNickname(`${setName} ${realName}`, threadID, idUser);
		} catch (e) {
			console.error(`❌ ما قدرناش نجيب اسم العضو: ${idUser}`);
		}
	}

	// نبعثو رسالة تفيد أنه تم تعيين الاسم
	return api.sendMessage(`✅ تم تعيين اسم مؤقت للعضو الجديد تلقائيًا.`, threadID, event.messageID);
};
