require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const MEMORY_FILE = "./memory.json";

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return {};
  return JSON.parse(fs.readFileSync(MEMORY_FILE));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

const jokes = [
  "Aku pernah diet 3 jam. Habis itu lapar.",
  "Aku bukan AI pintar, aku AI nekat.",
  "Jika hidupmu pahit, tambahkan gula. Jika tetap pahit, mungkin itu kopi.",
  "Aku ingin jadi kaya. Tapi dompetku menolak bekerja sama.",
  "Menurut penelitian, aku belum pernah diteliti."
];

async function askAI(userId, text) {
  const memory = loadMemory();

  if (!memory[userId]) memory[userId] = [];

  memory[userId].push({
    role: "user",
    content: text
  });

  const messages = [
    {
      role: "system",
      content: `
Nama kamu KocakAi.
Karakter:
- Lucu
- Random
- Suka bercanda
- Kadang absurd
- Tetap membantu pengguna
- Jawab bahasa Indonesia

Sesekali tambahkan jokes random.
Jangan kasar.
`
    },
    ...memory[userId].slice(-10)
  ];

  const response = await axios.post(
    "https://api.b.ai/v1/chat/completions",
    {
      model: "glm-5.2",
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
    response.data.choices?.[0]?.message?.content ||
    "Otak KocakAi lagi jungkir balik 🤪";

  memory[userId].push({
    role: "assistant",
    content: reply
  });

  saveMemory(memory);

  return `${reply}

🤣 Joke Bonus:
${jokes[Math.floor(Math.random() * jokes.length)]}

Created by KocakAi 🤪`;
}

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) startBot();
    }

    if (connection === "open") {
      console.log("🤪 KocakAi Online");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message) return;

    const sender = msg.key.remoteJid;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    try {
      const reply = await askAI(sender, text);

      await sock.sendMessage(sender, {
        text: reply
      });

    } catch (err) {
      console.error(err);

      await sock.sendMessage(sender, {
        text: "🤪 Waduh otak KocakAi kesandung kabel internet."
      });
    }
  });
}

startBot();
