module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "عبد العزيز 🇩🇿",
  description: "يبعت إشعار كي يخرج عضو من المجموعة"
};

module.exports.run = async function({ api, event, Users, Threads }) {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const moment = require("moment-timezone");
  const time = moment.tz("Africa/Algiers").format("DD/MM/YYYY || HH:mm:ss");
  const hours = moment.tz("Africa/Algiers").format("HH");

  const { threadID } = event;
  const data = global.data.threadData.get(threadID) || (await Threads.getData(threadID)).data;
  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId)
    || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
  const type = (event.author == event.logMessageData.leftParticipantFbId) ? "خرج بروحو" : "تم طرده";

  // رسالة تلقائية حسب الوقت
  let msg = typeof data.customLeave == "undefined" ? 
`🚪 شخص خرج من القروب:

👤 الاسم: {name}
🕓 الوقت: {time}
📌 الحالة: {type}
🗓️ الفترة: {session}

📣 نقولو ليه بالتوفيق وين ما راح.` : data.customLeave;

  // تعويض المتغيرات
  msg = msg
    .replace(/\{name}/g, name)
    .replace(/\{type}/g, type)
    .replace(/\{time}/g, time)
    .replace(/\{session}/g, 
      hours <= 10 ? "صباح" :
      hours <= 12 ? "قر mid" :
      hours <= 18 ? "عشية" :
      "ليل");

  return api.sendMessage({ body: msg }, threadID);
};
