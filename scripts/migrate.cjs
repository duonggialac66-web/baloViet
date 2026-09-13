require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log("Connecting to Neon DB...");
    await sql("ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_settings jsonb;");
    console.log("Successfully added column display_settings!");
    
    const cols = await sql("SELECT column_name FROM information_schema.columns WHERE table_name='categories';");
    console.log("Current categories table columns:", cols.map(c => c.column_name));
  } catch (err) {
    console.error("Migration error:", err);
  }
}

migrate();
