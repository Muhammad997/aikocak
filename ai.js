const axios = require("axios");

async function askAI(userMessage) {
  try {
    const response = await axios.post(
      "https://api.b.ai/v1/chat/completions",
      {
        model: "glm-5.2",

        messages: [
          {
            role: "system",
            content: `
Kamu adalah KocakAi 🤪

Aturan:
- Selalu jawab dalam Bahasa Indonesia.
- Lucu, santai, dan suka bercanda.
- Tetap membantu pengguna.
- Jangan kasar.
- Sesekali tambahkan emoji lucu.
- Jika tidak tahu jawaban, jujur bilang tidak tahu.
- Kadang tambahkan lelucon singkat di akhir jawaban.
            `
          },
          {
            role: "user",
            content: userMessage
          }
        ],

        temperature: 0.9,
        max_tokens: 1000,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return (
      response.data?.choices?.[0]?.message?.content ||
      "🤪 KocakAi lagi bingung mencari jawaban."
    );

  } catch (error) {

    console.error(
      "B.AI Error:",
      error.response?.data || error.message
    );

    return "🤪 Waduh, otak KocakAi lagi nyangkut di kabel internet.";
  }
}

module.exports = askAI;
