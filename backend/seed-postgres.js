const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/ai_chatbot',
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check if admin user exists
    const checkResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );

    if (checkResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (email, password) VALUES ($1, $2)',
        ['admin@example.com', hashedPassword]
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Admin credentials: admin@example.com / admin123');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

seed();