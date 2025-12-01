import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    console.log('[TEST-SIGNUP] Starting test signup');
    console.log('[TEST-SIGNUP] Email:', email);
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Check if user exists
    console.log('[TEST-SIGNUP] Checking if user exists');
    const existingUser = await pool.query(
      'SELECT * FROM auth_users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User already exists'
      }, { status: 400 });
    }

    // Create user
    const userId = crypto.randomUUID();
    console.log('[TEST-SIGNUP] Creating user with ID:', userId);
    
    const newUser = await pool.query(
      'INSERT INTO auth_users (id, name, email, "emailVerified", image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name || null, email, null, null]
    );
    
    console.log('[TEST-SIGNUP] User created:', newUser.rows[0]);

    // Hash password
    console.log('[TEST-SIGNUP] Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[TEST-SIGNUP] Password hashed successfully');

    // Create account
    console.log('[TEST-SIGNUP] Creating account');
    await pool.query(
      'INSERT INTO auth_accounts ("userId", provider, type, "providerAccountId", password) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'credentials', 'credentials', userId, hashedPassword]
    );
    
    console.log('[TEST-SIGNUP] Account created successfully');
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'User created successfully!',
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        name: newUser.rows[0].name
      }
    });
  } catch (error: any) {
    console.error('[TEST-SIGNUP] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
