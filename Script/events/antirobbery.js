module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "1.0.0",
  credits: "عبد العزيز",
  description: "يمنع تغييرات الأدمينات (نظام الحماية نيرو)"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const { logMessageType, logMessageData } = event;
  let data = (await Threads.getData(event.threadID)).data;

  // إذا الحماية طافية، ما يدير والو
  if (data.guard == false) return;

  if (data.guard == true) {
    switch (logMessageType) {
      case "log:thread-admins": {
        const isAdd = logMessageData.ADMIN_EVENT === "add_admin";
        const isRemove = logMessageData.ADMIN_EVENT === "remove_admin";
        const authorID = event.author;
        const targetID = logMessageData.TARGET_ID;
        const botID = api.getCurrentUserID();

        // ما يدير والو إذا البوت هو السبب أو المستهدف
        if (authorID == botID || targetID == botID) return;

        // منع أي واحد يبدّل مسؤولين بلا إذن
        if (isAdd) {
          api.changeAdminStatus(event.threadID, authorID, false, handleCallback);
          api.changeAdminStatus(event.threadID, targetID, false);
        } else if (isRemove) {
          api.changeAdminStatus(event.threadID, authorID, false, handleCallback);
          api.changeAdminStatus(event.threadID, targetID, true);
        }

        function handleCallback(err) {
          if (err) {
            return api.sendMessage(`⚠️ محاولة مشبوهة لتغيير المسؤولين تم رصدها، بصح ما قدرناش نرجع الأمور 🔒`, event.threadID, event.messageID);
          } else {
            return api.sendMessage(`🛡️ نظام الحماية "نيرو" تدخل ومنع التلاعب بالمسؤولين 👊\n⚠️ الرجاء احترام قوانين القروب.`, event.threadID, event.messageID);
          }
        }
        break;
      }
    }
  }
};
