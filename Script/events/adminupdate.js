module.exports.config = {
	name: "adminUpdate",
	eventType: ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "log:thread-call", "log:thread-color"],
	version: "1.0.1",
	credits: "عبد العزيز",
	description: "تحديث معلومات القروب تلقائيا",
	envConfig: {
		sendNoti: true,
	}
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	const fs = require("fs");
	var iconPath = __dirname + "/emoji.json";
	if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
	const { threadID, logMessageType, logMessageData } = event;
	const { setData, getData } = Threads;

	const thread = global.data.threadData.get(threadID) || {};
	if (typeof thread["adminUpdate"] != "undefined" && thread["adminUpdate"] == false) return;

	try {
		let dataThread = (await getData(threadID)).threadInfo;

		switch (logMessageType) {
			case "log:thread-admins": {
				if (logMessageData.ADMIN_EVENT == "add_admin") {
					dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
					if (global.configModule[this.config.name].sendNoti) api.sendMessage(
						`📢 إشعار: راهو ${logMessageData.TARGET_ID} ولى أدمين فالقروب 🔥`,
						threadID,
						async (error, info) => {
							if (global.configModule[this.config.name].autoUnsend) {
								await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
								return api.unsendMessage(info.messageID);
							} else return;
						}
					);
				} else if (logMessageData.ADMIN_EVENT == "remove_admin") {
					dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
					if (global.configModule[this.config.name].sendNoti) api.sendMessage(
						`📢 إشعار: نزعنا الأدمين من ${logMessageData.TARGET_ID} ❌ ما بقاش مسؤول فالقروب.`,
						threadID,
						async (error, info) => {
							if (global.configModule[this.config.name].autoUnsend) {
								await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
								return api.unsendMessage(info.messageID);
							} else return;
						}
					);
				}
				break;
			}

			case "log:thread-icon": {
				let preIcon = JSON.parse(fs.readFileSync(iconPath));
				dataThread.threadIcon = event.logMessageData.thread_icon || "👍";
				if (global.configModule[this.config.name].sendNoti) api.sendMessage(
					`🔧 تحديث: تبدلت أيقونة القروب\n🔁 الأيقونة القديمة: ${preIcon[threadID] || "ما كانش"}\n🆕 الجديدة: ${dataThread.threadIcon}`,
					threadID,
					async (error, info) => {
						preIcon[threadID] = dataThread.threadIcon;
						fs.writeFileSync(iconPath, JSON.stringify(preIcon));
						if (global.configModule[this.config.name].autoUnsend) {
							await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
							return api.unsendMessage(info.messageID);
						} else return;
					}
				);
				break;
			}

			case "log:thread-call": {
				if (logMessageData.event === "group_call_started") {
					const name = await Users.getNameUser(logMessageData.caller_id);
					api.sendMessage(`📞 نداء جماعي بدا من عند ${name} ${(logMessageData.video) ? '(فيديو)' : '(صوتي)'}`, threadID);
				} else if (logMessageData.event === "group_call_ended") {
					const callDuration = logMessageData.call_duration;
					const hours = Math.floor(callDuration / 3600);
					const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
					const seconds = callDuration - (hours * 3600) - (minutes * 60);
					const timeFormat = `${hours}:${minutes}:${seconds}`;
					api.sendMessage(`📴 النداء ${(logMessageData.video) ? "بالفيديو " : ""}سالا\n⏱️ المدة: ${timeFormat}`, threadID);
				} else if (logMessageData.joining_user) {
					const name = await Users.getNameUser(logMessageData.joining_user);
					api.sendMessage(`👤 ${name} دخل للنداء ${(logMessageData.group_call_type == '1') ? '(فيديو)' : '(صوتي)'}`, threadID);
				}
				break;
			}

			case "log:thread-color": {
				dataThread.threadColor = event.logMessageData.thread_color || "🌈";
				if (global.configModule[this.config.name].sendNoti) api.sendMessage(
					`🎨 لون القروب تبدل: ${event.logMessageBody.replace("Theme", "اللون")}`,
					threadID,
					async (error, info) => {
						if (global.configModule[this.config.name].autoUnsend) {
							await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
							return api.unsendMessage(info.messageID);
						} else return;
					}
				);
				break;
			}

			case "log:user-nickname": {
				dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;
				if (typeof global.configModule["nickname"] != "undefined"
					&& !global.configModule["nickname"].allowChange.includes(threadID)
					&& !dataThread.adminIDs.some(item => item.id == event.author)
					|| event.author == api.getCurrentUserID()) return;

				if (global.configModule[this.config.name].sendNoti) api.sendMessage(
					`📛 لقب جديد: ${logMessageData.participant_id} ولى كينوه بـ: ${(logMessageData.nickname.length == 0) ? "الإسم الأصلي" : logMessageData.nickname}`,
					threadID,
					async (error, info) => {
						if (global.configModule[this.config.name].autoUnsend) {
							await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
							return api.unsendMessage(info.messageID);
						} else return;
					}
				);
				break;
			}

			case "log:thread-name": {
				dataThread.threadName = event.logMessageData.name || "ما كاش اسم";
				if (global.configModule[this.config.name].sendNoti) api.sendMessage(
					`✏️ تبدل اسم القروب لـ: ${dataThread.threadName}`,
					threadID,
					async (error, info) => {
						if (global.configModule[this.config.name].autoUnsend) {
							await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
							return api.unsendMessage(info.messageID);
						} else return;
					}
				);
				break;
			}
		}

		await setData(threadID, { threadInfo: dataThread });
	} catch (e) {
		console.log(e);
	}
};
