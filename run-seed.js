const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runSeed() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    await client.query(seedSQL);
    console.log('Seed script executed successfully');
  } catch (err) {
    console.error('Error running seed:', err);
  } finally {
    await client.end();
  }
}

runSeed();