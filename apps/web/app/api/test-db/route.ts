import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Pool created, attempting query...');
    const result = await pool.query('SELECT NOW()');
    console.log('Query successful:', result.rows[0]);

    // Test if auth tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'auth_%'
    `);
    
    console.log('Auth tables found:', tablesResult.rows);

    await pool.end();

    return NextResponse.json({
      success: true,
      timestamp: result.rows[0],
      tables: tablesResult.rows,
      message: 'Database connection successful!'
    });
  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
