module.exports.config = {
  name: "upt",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "نيرو ☠️",
  description: "مراقبة وقت تشغيل البوت",
  commandCategory: "🛠️ الصيانة",
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

  if (url.match(linkRegex) == null)
    return api.sendMessage(`╔══════ ⸙『𝗨𝗣𝗧𝗜𝗠𝗘 - نيرو ☠️』⸙ ══════╗

⏱️ البوت راهو شغال:
${hours} سـ / ${minutes} د / ${seconds} ثـ

⚠️ باش تدير المراقبة، بعت رابط موقع أو خدمتك.
╚════════════════════╝`, event.threadID, event.messageID);

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
    if (error) return api.sendMessage("🚫 صرات غلطة، جرب مرة أخرى.", event.threadID, event.messageID);

    if (JSON.parse(body).stat == 'fail') {
      return api.sendMessage(`✖️ الرابط هذا راهو ديجا في الخدمة:
🔗 ${url}`, event.threadID, event.messageID);
    }

    if (JSON.parse(body).stat == 'success') {
      return api.sendMessage(`✅ تم إضافة الرابط بنجاح في Uptime Robot:
🔗 ${url}`, event.threadID, event.messageID);
    }
  });
     }
