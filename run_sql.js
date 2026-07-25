const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide a path to the SQL file.");
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`Executing SQL from ${filePath}...`);
    await client.query(sql);
    console.log("Execution successful!");
  } catch (err) {
    console.error("Error executing SQL:", err.message);
  } finally {
    await client.end();
  }
}

run();
