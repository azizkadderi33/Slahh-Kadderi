module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "0.0.1",
  credits: "عبد العزيز",
  description: "يمنع الخروج من القروب بدون إذن"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  let data = (await Threads.getData(event.threadID)).data || {};

  // إذا الحماية antiout طافية، يخرج من الخدمة
  if (data.antiout == false) return;

  // إذا البوت هو اللي خرج، ما يدير والو
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const userID = event.logMessageData.leftParticipantFbId;
  const name = global.data.userName.get(userID) || await Users.getNameUser(userID);
  const type = (event.author == userID) ? "self-separation" : "removed";

  if (type === "self-separation") {
    api.addUserToGroup(userID, event.threadID, async (error) => {
      if (error) {
        return api.sendMessage(
          `⚠️ ما قدرتش نرجّع ${name} للقروب.\n🔒 يمكن راهو حابسينلو الميسنجر ولا راهو مسكر الإضافة.\n\n🛡️ البوت: نيرو`,
          event.threadID
        );
      } else {
        return api.sendMessage(
          `🚫 ${name} خرج من القروب بلا إذن!\n🔁 رجعناه بالقوة 👊 لأنك ما تقدرش تخرج وحدك فهاد القروب!\n\n🛡️ الحماية مشغلة بواسطة البوت: نيرو`,
          event.threadID
        );
      }
    });
  }
};
