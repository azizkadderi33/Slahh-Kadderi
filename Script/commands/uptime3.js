module.exports.config = {
  name: "وقت",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "نيرو ☠️",
  description: "⏱️ عرض مدة تشغيل البوت أو مراقبة رابط",
  commandCategory: "⚙️ صيانة",
  usages: "[رابط]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  let time = process.uptime();
  let hours = Math.floor(time / (60 * 60));
  let minutes = Math.floor((time % (60 * 60)) / 60);
  let seconds = Math.floor(time % 60);
  var url = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
  var linkRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

  if (url.match(linkRegex) == null) {
    return api.sendMessage(`╔══『 ⚡ نيرو ☠️ - مدة التشغيل ⚡ 』══╗
⏱️ راهو خدام منذ:
🕓 ${hours} ساعة - ${minutes} دقيقة - ${seconds} ثانية
📌 بعت رابط موقعك باش نراقبوه ليك.
╚══════════════════════════╝`, event.threadID, event.messageID);
  }

  var request = require("request");
  var options = {
    method: 'POST',
    url: 'https://api.uptimerobot.com/v2/newMonitor',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      api_key: 'u2008156-9837ddae6b3c429bd0315101',
      format: 'json',
      type: '1',
      url: url,
      friendly_name: `نيرو-${Date.now()}`
    }
  };

  request(options, function (error, response, body) {
    if (error) return api.sendMessage("❌ صار خطأ يا خو، حاول مرة ثانية.", event.threadID, event.messageID);

    const res = JSON.parse(body);
    if (res.stat === 'fail') {
      return api.sendMessage(`⚠️ هذا الرابط راهو مسجل من قبل:
🔗 ${url}`, event.threadID, event.messageID);
    }

    if (res.stat === 'success') {
      return api.sendMessage(`✅ تم تفعيل المراقبة للرابط بنجاح:
🔗 ${url}
🛡️ البوت نيرو راهو يراقب الخدمة 🔥`, event.threadID, event.messageID);
    }
  });
          }
