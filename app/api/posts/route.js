import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin, supabase } from '../../../lib/supabase';

// GET: list published posts (optionally by city/category)
export async function GET(req) {
  if (!supabase) return NextResponse.json({ posts: [] });
  const { searchParams } = new URL(req.url);
  let q = supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false });
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  if (city) q = q.eq('city', city);
  if (category) q = q.eq('category', category);
  const { data, error } = await q.limit(30);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

// POST: journalist creates a local news post (cookie-protected)
export async function POST(req) {
  const authed = cookies().get('cms')?.value === '1';
  if (!authed) return NextResponse.json({ error: 'لاگ ان ڪريو' }, { status: 401 });

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Supabase env not set' }, { status: 500 });

  const body = await req.json();
  if (!body.title || !body.body) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  const { error } = await admin.from('posts').insert({
    title: body.title,
    body: body.body,
    city: body.city,
    category: body.category,
    published: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
