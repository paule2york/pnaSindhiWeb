import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/cms-middleware';

// GET /api/cms/users — list all users (admin only)
export async function GET(req) {
  const { error, user } = await requireAuth(req, ['admin']);
  if (error) return error;

  const admin = supabaseAdmin();
  const { data, error: dbError } = await admin
    .from('cms_users')
    .select('id, email, name, role, allowed_cities, is_active, created_at')
    .order('id');

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ users: data });
}

// POST /api/cms/users — create new user (admin only)
export async function POST(req) {
  const { error, user: adminUser } = await requireAuth(req, ['admin']);
  if (error) return error;

  const body = await req.json();
  const { email, password, name, role, allowed_cities } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (!['admin', 'editor', 'journalist'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (role === 'journalist' && (!allowed_cities || !allowed_cities.length)) {
    return NextResponse.json({ error: 'Journalist must have at least one city' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { hashPassword } = await import('../../../../lib/cms-auth');
  const password_hash = await hashPassword(password);

  const { data, error: dbError } = await admin
    .from('cms_users')
    .insert({
      email,
      password_hash,
      name,
      role,
      allowed_cities: allowed_cities || [],
    })
    .select('id, email, name, role, allowed_cities')
    .maybeSingle();

  if (dbError) {
    if (dbError.message.includes('duplicate')) {
      return NextResponse.json({ error: 'ای ميل اڳ ۾ رجسٽر ٿيل آهي' }, { status: 409 });
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
