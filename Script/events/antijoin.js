module.exports.config = {
  name: "antijoin",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "عبد العزيز",
  description: "منع دخول أعضاء جدد للقروب تلقائيا (نظام الحماية نيرو)"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  let data = (await Threads.getData(event.threadID)).data;

  // إذا كانت الخاصية antijoin ملغية، ما يدير والو
  if (data.newMember == false) return;

  // إذا البوت هو اللي تضاف، ما يدير والو
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return;

  else if (data.newMember == true) {
    var memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId);
    
    for (let idUser of memJoin) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      api.removeUserFromGroup(idUser, event.threadID, async function (err) {
        if (err) {
          data["newMember"] = false;
          return;
        }

        await Threads.setData(event.threadID, { data });
        global.data.threadData.set(event.threadID, data);
      });
    }

    return api.sendMessage(
      `🚫 تم تفعيل وضع الحماية (🚷 Anti Join)\n👤 ممنوع دخول أعضاء جدد حالياً.\n✅ إذا كنت مسؤول وحاب تضيف ناس، لازم تطفي الوضع.\n\n🛡️ البوت: نيرو`,
      event.threadID
    );
  }
};
