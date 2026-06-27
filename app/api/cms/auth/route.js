import { NextResponse } from 'next/server';

// Simple demo auth: compares against CMS_PASSWORD and sets a cookie.
export async function POST(req) {
  const { password } = await req.json();
  const expected = process.env.CMS_PASSWORD || 'changeme';
  if (password !== expected) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('cms', '1', { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 });
  return res;
}
