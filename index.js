require("dotenv").config();

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const axios = require("axios");
const pino = require("pino");
const Database = require("better-sqlite3");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

console.log("🚀 KocakAi Starting...");

const db = new Database("memory.db");

db.exec(`
CREATE TABLE IF NOT EXISTS memory(
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id TEXT,
role TEXT,
content TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

const jokes = [
  "Aku pernah diet 3 jam. Lalu menyerah.",
  "Dompetku dan mimpiku sedang LDR.",
  "Menurut penelitian, aku belum pernah diteliti.",
  "Aku AI, bukan cenayang.",
  "Jangan menyerah. WiFi saja kadang reconnect."
];

function saveMemory(user, role, content) {
  db.prepare(
    "INSERT INTO memory(user_id,role,content) VALUES(?,?,?)"
  ).run(user, role, content);
}

function getMemory(user) {
  return db.prepare(
    `SELECT role,content
     FROM memory
     WHERE user_id=?
     ORDER BY id DESC
     LIMIT 10`
  ).all(user).reverse();
}

async function askAI(userId, text) {

  saveMemory(userId, "user", text);

  const messages = [
    {
      role: "system",
      content: `
Kamu adalah KocakAi.

Karakter:
- Lucu
- Random
- Suka bercanda
- Absurd
- Bahasa Indonesia
- Tetap membantu

Tambahkan humor seperlunya.
`
    },
    ...getMemory(userId),
    {
      role: "user",
      content: text
    }
  ];

  const response = await axios.post(
    "https://api.b.ai/v1/chat/completions",
    {
      model: process.env.MODEL || "glm-5.2",
      messages,
      temperature: 0.9,
      max_tokens: 1000
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.BAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const reply =
    response.data?.choices?.[0]?.message?.content ||
    "🤪 Otakku lagi salto.";

  saveMemory(userId, "assistant", reply);

  return `${reply}

🤣 Joke:
${jokes[Math.floor(Math.random()*jokes.length)]}

Created by KocakAi`;
}

async function startBot() {

  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {

    const code =
      await sock.requestPairingCode(
        process.env.PHONE_NUMBER
      );

    console.log("");
    console.log("=================================");
    console.log("PAIRING CODE:");
    console.log(code);
    console.log("=================================");
    console.log("");
  }

  sock.ev.on(
    "connection.update",
    ({ connection, lastDisconnect }) => {

      console.log("Connection:", connection);

      if (connection === "open") {
        console.log("✅ KocakAi Online");
      }

      if (connection === "close") {

        console.log("❌ Connection Closed");

        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          startBot();
        }
      }
    }
  );

  sock.ev.on(
    "messages.upsert",
    async ({ messages }) => {

      const msg = messages[0];

      if (!msg.message) return;

      if (msg.key.fromMe) return;

      const sender = msg.key.remoteJid;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text;

      if (!text) return;

      try {

        console.log(
          `📩 ${sender}: ${text}`
        );

        const reply =
          await askAI(sender, text);

        await sock.sendMessage(
          sender,
          { text: reply }
        );

      } catch (err) {

        console.error(err);

        await sock.sendMessage(
          sender,
          {
            text:
              "🤪 Waduh, otak KocakAi lagi reboot."
          }
        );
      }
    }
  );
}

startBot();
