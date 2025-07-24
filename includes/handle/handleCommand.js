module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require('string-similarity');
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const logger = require("../../utils/log.js");
  const axios = require('axios');
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaOnly } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    let { body, senderID, threadID, messageID, attachments = [] } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    // 📌 Ignore empty/invalid image-only messages
    if (attachments.length > 0 && !body && !attachments.some(file => file.type === 'photo' && file.url)) return;

    const threadSetting = threadData.get(threadID) || {};
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(threadSetting.PREFIX || PREFIX)})\\s*`);
    if (!body || !prefixRegex.test(body)) return;

    // 🧑‍💻 admin check
    const adminbot = require('./../../config.json');
    if (!global.data.allThreadID.includes(threadID) && !ADMINBOT.includes(senderID) && adminbot.adminPaOnly)
      return api.sendMessage("🛑 نيرو: فقط المشرفين يمكنهم استخدام البوت في الخاص", threadID, messageID);

    if (!ADMINBOT.includes(senderID) && adminbot.adminOnly)
      return api.sendMessage("🛑 نيرو: الوضع مقفل على المشرفين فقط", threadID, messageID);

    if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.ndhOnly)
      return api.sendMessage("🛑 نيرو: فقط دعم البوت (NDH) يمكنهم استخدام الأوامر", threadID, messageID);

    const dataAdbox = require('../../Script/commands/cache/data.json');
    const threadInf = threadInfo.get(threadID) || await Threads.getInfo(threadID);
    const findd = threadInf.adminIDs.find(el => el.id == senderID);
    if (dataAdbox.adminbox[threadID] && !ADMINBOT.includes(senderID) && !findd && event.isGroup)
      return api.sendMessage("🛑 نيرو: فقط أدمن المجموعة يمكنهم استخدام الأوامر", threadID, messageID);

    if ((userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox === false && senderID === threadID) && !ADMINBOT.includes(senderID)) {
      const { reason, dateAdded } = userBanned.get(senderID) || threadBanned.get(threadID) || {};
      return api.sendMessage(`🚫 نيرو: تم حظرك من استخدام البوت\nالسبب: ${reason || "غير معروف"}\nمنذ: ${dateAdded || "غير معروف"}`, threadID, async (err, info) => {
        await new Promise(r => setTimeout(r, 5000));
        api.unsendMessage(info.messageID);
      }, messageID);
    }

    const [matchedPrefix] = body.match(prefixRegex);
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    let command = commands.get(commandName);

    if (!command) {
      const allCommandName = [...commands.keys()];
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
      if (checker.bestMatch.rating >= 0.5)
        command = commands.get(checker.bestMatch.target);
      else
        return api.sendMessage(`❌ نيرو: الأمر "${commandName}" غير موجود.\nهل كنت تقصد: "${checker.bestMatch.target}"؟`, threadID);
    }

    const banThreads = commandBanned.get(threadID) || [],
      banUsers = commandBanned.get(senderID) || [];

    if ((banThreads.includes(command.config.name) || banUsers.includes(command.config.name)) && !ADMINBOT.includes(senderID))
      return api.sendMessage(`🚫 نيرو: الأمر ${command.config.name} محظور بالنسبة لك أو للمجموعة`, threadID, messageID);

    if (command.config.commandCategory?.toLowerCase() === 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))
      return api.sendMessage(`🚫 نيرو: هذه المجموعة لا تسمح بمحتوى NSFW`, threadID, async (err, info) => {
        await new Promise(r => setTimeout(r, 5000));
        api.unsendMessage(info.messageID);
      }, messageID);

    let permssion = 0;
    const threadInfoo = threadInfo.get(threadID) || await Threads.getInfo(threadID);
    const find = threadInfoo.adminIDs.find(el => el.id == senderID);
    if (NDH.includes(senderID)) permssion = 2;
    else if (ADMINBOT.includes(senderID)) permssion = 3;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion)
      return api.sendMessage(`⛔ نيرو: ليس لديك صلاحية كافية لتنفيذ الأمر ${command.config.name}`, threadID, messageID);

    if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Map());
    const timestamps = cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;

    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime)
      return api.sendMessage(`⌛ نيرو: يرجى الانتظار ${(timestamps.get(senderID) + expirationTime - dateNow) / 1000}s قبل استخدام الأمر مجددًا`, threadID, messageID);

    const getText2 = (...v) => {
      if (command.languages?.[global.config.language]?.[v[0]]) {
        let lang = command.languages[global.config.language][v[0]];
        for (let i = v.length - 1; i >= 1; i--) lang = lang.replace(RegExp('%' + i, 'g'), v[i]);
        return lang;
      }
      return '';
    };

    try {
      const Obj = { api, event, args, models, Users, Threads, Currencies, permssion, getText: getText2 };
      await command.run(Obj);
      timestamps.set(senderID, dateNow);
      if (DeveloperMode)
        logger(`[نيرو] ✅ ${time} | ${commandName} | ${senderID} @ ${threadID} | args: ${args.join(' ')} | ${Date.now() - dateNow}ms`);
    } catch (e) {
      return api.sendMessage(`💥 نيرو: حدث خطأ في الأمر ${commandName}\n${e}`, threadID);
    }
  };
};
