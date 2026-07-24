import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/cms-middleware';
import { shortId } from '../../../../lib/url';

// GET /api/cms/blocked — list all blocked articles
export async function GET(req) {
  const { error } = await requireAuth(req);
  if (error) return error;

  const admin = supabaseAdmin();
  const { data, error: dbErr } = await admin
    .from('cms_blocked')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ blocked: data || [] });
}

// POST /api/cms/blocked — block an article by URL
export async function POST(req) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const body = await req.json();
  const { link, title } = body;

  if (!link) {
    return NextResponse.json({ error: 'link required' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Check if already blocked
  const { data: existing } = await admin
    .from('cms_blocked')
    .select('id')
    .eq('link', link)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, message: 'already blocked' });
  }

  const { error: insertErr } = await admin
    .from('cms_blocked')
    .insert({
      link,
      short_id: shortId(link),
      title: title || '',
      blocked_by: user.id,
    });

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE /api/cms/blocked — unblock an article
export async function DELETE(req) {
  const { error } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error: delErr } = await admin
    .from('cms_blocked')
    .delete()
    .eq('id', id);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
