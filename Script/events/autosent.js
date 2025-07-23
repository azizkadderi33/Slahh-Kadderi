module.exports.config = {
  name: "autosend",
  eventType: [],
  version: "0.0.1",
  credits: "عبد العزيز",
  description: "إرسال رسالة تلقائية لجميع القروبات في وقت محدد"
};

module.exports.run = async ({ event, api, Threads, Users, args }) => {
  const moment = require("moment-timezone");

  // توقيت الجزائر
  const time = moment.tz('Africa/Algiers').format('HH:mm:ss');

  // وقت التفعيل (مثال: 17:00:00)
  if (time === "17:00:00") {
    const cantsend = [];
    const allThread = global.data.allThreadID || [];

    for (const idThread of allThread) {
      if (!isNaN(parseInt(idThread)) && idThread != event.threadID) {
        api.sendMessage(
          `📢 رسالة تلقائية من البوت نيرو\n💬 مرحبا بالجميع، تذكيركم تبقو محترمين وتخليو الجو مريح للجميع 🔥`,
          idThread,
          (error) => {
            if (error) cantsend.push(idThread);
          }
        );
      }
    }

    // إرسال تقرير للأدمنات في حالة وجود أخطاء
    for (const adminID of global.config.ADMINBOT) {
      if (cantsend.length > 0) {
        api.sendMessage(
          `⚠️ ما قدرناش نبعت الرسالة التلقائية لهاد القروبات:\n${cantsend.join("\n")}`,
          adminID
        );
      }
    }
  }
};
