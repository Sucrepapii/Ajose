const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.kcwcdkanpmonimcdzeix:FCPD8jMSSOWzX8pj@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
});

async function resetBvn() {
  try {
    await client.connect();
    const result = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
    console.log(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

resetBvn();
