const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.dwlmnplsmcgktedrrbxj:MySupabase00.@aws-1-us-west-2.pooler.supabase.com:6543/postgres",
});

async function run() {
  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Query result:", res.rows[0]);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.end();
  }
}

run();
