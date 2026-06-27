require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const askAI = require("./ai");
const { randomJoke } = require("./jokes");
const memory = require("./memory");

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const P = require("pino");

const sock = makeWASocket({
  auth: state,
  logger: P({ level: "silent" })
});
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("Koneksi terputus.");

      if (shouldReconnect) {
        startBot();
      }
    }

    if (connection === "open") {
      console.log("✅ KocakAi berhasil terhubung!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg.message) return;
      if (msg.key.fromMe) return;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      if (!text) return;

      const sender = msg.key.remoteJid;

      console.log(`[${sender}] ${text}`);

      // Simpan ke memory
   memory.save(sender, text, "user");

const aiReply = await askAI(text);

memory.save(sender, aiReply, "assistant");

      // Perintah khusus
      if (text.toLowerCase() === ".joke") {
        return await sock.sendMessage(sender, {
          text: `🤣 ${randomJoke()}`
        });
      }

      if (text.toLowerCase() === ".ping") {
        return await sock.sendMessage(sender, {
          text: "🏓 Pong! KocakAi aktif."
        });
      }

      // Tanya AI
      const aiReply = await askAI(text);

      const finalReply = `
${aiReply}

🤣 Joke Acak:
${randomJoke()}

━━━━━━━━━━━━━━
🤖 KocakAi
Created By Muhammad Sulaiman
`;

      await sock.sendMessage(sender, {
        text: finalReply.trim()
      });

    } catch (err) {
      console.error(err);

      await sock.sendMessage(
        messages[0].key.remoteJid,
        {
          text: "🤪 Waduh otak KocakAi lagi tersandung kabel internet."
        }
      );
    }
  });
}

startBot();
