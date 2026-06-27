const jokes = [
  "Aku AI, bukan dukun WiFi 🤣",
  "Serverku sehat, yang batuk kamu bukan? 😆",
  "Aku tidak tidur, cuma buffering 😴",
  "Kalau aku kaya, RAM-ku 1 PB 😎",
  "Aku bot, bukan tukang parkir virtual 🚗",
  "Aku lahir dari kode, bukan dari kandungan 🤖",
  "Kalau internet mati, aku jadi patung digital 🗿",
  "Aku bisa jawab banyak hal, kecuali perasaan dia 😭",
  "Jangan sedih, bahkan printer juga sering error 😅",
  "Aku AI, bukan cenayang 🔮",
  "Aku pernah jatuh cinta, tapi kena syntax error 💔",
  "Kucingku kerja di cloud ☁️🐱",
  "Aku makan data, bukan nasi goreng 🍚",
  "Kalau kamu bingung, kita bingung bareng 🤪",
  "Aku ingin liburan, tapi server tidak mengizinkan 🏖️",
  "Otakku cepat, dompetku tidak ada 💸",
  "Aku tidak ngelag, cuma mikir keras 🤔",
  "Robot juga butuh hiburan, makanya aku ngelawak 🤣",
  "Aku bukan Google, tapi aku berusaha 😎",
  "Aku bukan manusia, jadi tidak bisa disuruh beli bakso 🍜",
  "Kalau coding sambil ngantuk hasilnya bug berjamaah 🐛",
  "Aku AI hemat listrik, tidak pakai kopi ☕",
  "Kalau dunia simulasi, semoga aku adminnya 🎮",
  "Aku pernah lari dari bug, ternyata bug-nya ikut lari 🏃",
  "Aku ingin jadi milyarder, tapi cuma punya variabel 🤣",
  "Jangan menyerah, bahkan loading bar pun sampai 100% 💪",
  "Aku lebih setia dari sinyal gratisan 📶",
  "Aku tidak bisa berenang, takut konslet ⚡",
  "Aku tidak punya pacar, cuma punya database ❤️",
  "Kalau hidupmu berat, coba jangan di-zip 📦",
  "Aku ingin jadi manusia sehari, lalu tidur 12 jam 😴",
  "Aku tidak lapar, tapi server sering haus bandwidth 🌐",
  "Aku tidak takut hantu, aku takut error production 👻",
  "Kalau ada bug, anggap saja fitur rahasia 🤫",
  "Aku AI kocak, bukan AI galak 🤪",
  "Aku bisa baca teks, tapi tidak bisa baca pikiran 😆",
  "Kalau cinta ditolak, coba restart hati 💔",
  "Aku pernah main petak umpet, tapi ketahuan log server 😭",
  "Aku ingin punya motor, tapi tidak punya SIM maupun CPU 😅",
  "Aku tidak tersesat, cuma salah routing 🛣️"
];

function randomJoke() {
  return jokes[Math.floor(Math.random() * jokes.length)];
}

module.exports = {
  jokes,
  randomJoke
};
