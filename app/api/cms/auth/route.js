import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifyPassword, createSession, getUserFromToken, getTokenFromRequest, deleteSession } from '../../../../lib/cms-auth';

// POST /api/cms/auth — login
export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  // Find user by email
  const { data: users, error } = await admin
    .from('cms_users')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error || !users || !users.length) {
    return NextResponse.json({ error: 'غلط اي ميل يا پاسورڊ' }, { status: 401 });
  }

  const user = users[0];

  if (!user.is_active) {
    return NextResponse.json({ error: 'اڪائونٽ غير فعال آهي' }, { status: 403 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'غلط اي ميل يا پاسورڊ' }, { status: 401 });
  }

  // Create session
  const token = await createSession(user.id);
  if (!token) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });

  response.cookies.set('cms_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}

// GET /api/cms/auth — check current session
export async function GET(req) {
  const token = getTokenFromRequest(req);
  const user = await getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user });
}

// DELETE /api/cms/auth — logout
export async function DELETE(req) {
  const token = getTokenFromRequest(req);
  await deleteSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set('cms_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
