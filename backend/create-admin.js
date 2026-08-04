require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_chatbot',
});

async function createAdmin() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hashedPassword);

    await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      ['admin@example.com', hashedPassword]
    );
    console.log('Admin user created successfully');
    console.log('Credentials: admin@example.com / admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdmin();