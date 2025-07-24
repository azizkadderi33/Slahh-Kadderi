const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "فاصي",
  version: "1.0.3",
  credits: "『👑 عبد العزيز قدوري 🔥』",
  description: "🗑️ حذف كل أوامر .js من مجلد commands فقط (بدون المجلدات الفرعية)",
  usage: "/deletecmds",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const OWNER_UID = "100000389910030"; // UID تاعك مطور البوت

  if (event.senderID !== OWNER_UID) {
    return api.sendMessage("🚫 هذا الأمر مسموح فقط للمطور!", event.threadID, event.messageID);
  }

  const commandsDir = __dirname;
  const thisFile = path.basename(__filename);
  let deleted = 0;

  try {
    const files = fs.readdirSync(commandsDir);
    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      if (
        file.endsWith(".js") &&
        file !== thisFile &&
        fs.statSync(filePath).isFile()
      ) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }

    api.sendMessage(`☠️ تم حذف ${deleted} ملف .js من مجلد الأوامر بنجاح.`, event.threadID, event.messageID);
  } catch (err) {
    api.sendMessage(`❌ خطأ أثناء الحذف: ${err.message}`, event.threadID, event.messageID);
  }
};
