const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("❌ Gagal membuka database:", err.message);
  } else {
    console.log("✅ SQLite terhubung");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function save(userId, content, role = "user") {
  db.run(
    "INSERT INTO memory (user_id, role, content) VALUES (?, ?, ?)",
    [userId, role, content],
    (err) => {
      if (err) {
        console.error("❌ Gagal menyimpan memory:", err.message);
      }
    }
  );
}

function getHistory(userId, limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT role, content
      FROM memory
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ?
      `,
      [userId, limit],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.reverse());
        }
      }
    );
  });
}

function clearHistory(userId) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM memory WHERE user_id = ?",
      [userId],
      (err) => {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
}

module.exports = {
  save,
  getHistory,
  clearHistory,
  db
};
