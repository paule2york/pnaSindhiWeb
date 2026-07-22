import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { requireAuth } from '../../../../../lib/cms-middleware';

// GET /api/cms/posts/[id] — get single post
export async function GET(req, { params }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const admin = supabaseAdmin();

  const { data, error: dbError } = await admin
    .from('cms_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ post: data });
}

// PATCH /api/cms/posts/[id] — update a post
export async function PATCH(req, { params }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const admin = supabaseAdmin();

  // Journalist can only edit their own posts
  if (user.role === 'journalist') {
    const { data: existing } = await admin
      .from('cms_posts')
      .select('author_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.author_id !== user.id) {
      return NextResponse.json({ error: 'توهان صرف پنهنجي خبرون ئي سنڌاري سگهو ٿا' }, { status: 403 });
    }
  }

  const { title, body: content, image, city, category, published } = body;

  const { data, error: dbError } = await admin
    .from('cms_posts')
    .update({
      title,
      body: content,
      image: image || '',
      city: city || '',
      category: category || 'local',
      published: published !== undefined ? published : true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, title, updated_at')
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ post: data });
}

// DELETE /api/cms/posts/[id] — delete a post
export async function DELETE(req, { params }) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const admin = supabaseAdmin();

  // Journalist can only delete their own posts
  if (user.role === 'journalist') {
    const { data: existing } = await admin
      .from('cms_posts')
      .select('author_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.author_id !== user.id) {
      return NextResponse.json({ error: 'توهان صرف پنهنجي خبرون ئي ختم ڪري سگهو ٿا' }, { status: 403 });
    }
  }

  const { error: dbError } = await admin.from('cms_posts').delete().eq('id', id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
