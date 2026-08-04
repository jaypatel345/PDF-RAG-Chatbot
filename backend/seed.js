const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

async function seed() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER,
      page_count INTEGER,
      processing_status TEXT DEFAULT 'pending',
      error_message TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      source_document TEXT,
      page_number INTEGER,
      suggested_questions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)').run('admin@example.com', hashedPassword);

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@example.com / admin123');
}

seed().catch(console.error);