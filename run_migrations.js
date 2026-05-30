const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const password = Buffer.from('5omz5b2w45iw5oiz45Wj44yy44Wh45Sy5pWi5oi35oi55pCw45y15pGm5pS544Wh5pC0452i46C245Gh46S146C5', 'base64').toString('utf8');
const pool = new Pool({
  connectionString: 'postgresql://postgres.ljhhzbifxtryglamrskw@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  password: password,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT 1 as test');
    console.log('Connected!', JSON.stringify(result.rows[0]));
    
    // List and run migrations
    const migDir = 'D:\\final\\supabase\\migrations';
    const files = fs.readdirSync(migDir).sort();
    console.log('Found ' + files.length + ' migration files');
    
    for (const f of files) {
      const sql = fs.readFileSync(path.join(migDir, f), 'utf8');
      try {
        await client.query(sql);
        console.log('OK: ' + f);
      } catch(err) {
        console.log('ERR: ' + f + ' - ' + err.message.substring(0, 200));
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
