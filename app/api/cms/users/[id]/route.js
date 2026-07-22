import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { requireAuth } from '../../../../../lib/cms-middleware';
import { hashPassword } from '../../../../../lib/cms-auth';

// GET /api/cms/users/[id] — get single user
export async function GET(req, { params }) {
  const { error } = await requireAuth(req, ['admin']);
  if (error) return error;

  const { id } = await params;
  const admin = supabaseAdmin();

  const { data, error: dbError } = await admin
    .from('cms_users')
    .select('id, email, name, role, allowed_cities, is_active, created_at')
    .eq('id', id)
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ user: data });
}

// PATCH /api/cms/users/[id] — update user (admin only)
export async function PATCH(req, { params }) {
  const { error, user: adminUser } = await requireAuth(req, ['admin']);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const admin = supabaseAdmin();

  const updates = {};
  if (body.name) updates.name = body.name;
  if (body.role) updates.role = body.role;
  if (body.allowed_cities) updates.allowed_cities = body.allowed_cities;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.password) {
    updates.password_hash = await hashPassword(body.password);
  }

  updates.updated_at = new Date().toISOString();

  const { data, error: dbError } = await admin
    .from('cms_users')
    .update(updates)
    .eq('id', id)
    .select('id, email, name, role, allowed_cities, is_active')
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ user: data });
}

// DELETE /api/cms/users/[id] — delete user (admin only)
export async function DELETE(req, { params }) {
  const { error, user: adminUser } = await requireAuth(req, ['admin']);
  if (error) return error;

  const { id } = await params;

  // Don't allow deleting yourself
  if (String(id) === String(adminUser.id)) {
    return NextResponse.json({ error: 'پنهنجو پاڻ کي ناهي ختم ڪري سگهو' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error: dbError } = await admin.from('cms_users').delete().eq('id', id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
