import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/cms-middleware';

// GET /api/cms/posts — list all CMS posts
export async function GET(req) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const admin = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  
  let query = admin
    .from('cms_posts')
    .select('id, title, image, city, category, author_id, published, created_at, updated_at')
    .order('created_at', { ascending: false });

  // Journalist can only see their own posts
  if (user.role === 'journalist') {
    query = query.eq('author_id', user.id);
  }

  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
  const { data, error: dbError } = await query.limit(limit);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ posts: data });
}

// POST /api/cms/posts — create a new CMS post
export async function POST(req) {
  const { error, user } = await requireAuth(req);
  if (error) return error;

  const body = await req.json();
  const { title, body: content, image, city, category } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'عنوان ۽ متن ضروري آهي' }, { status: 400 });
  }

  // Journalist can only post to their allowed cities
  if (user.role === 'journalist') {
    const allowed = user.allowed_cities || [];
    if (city && !allowed.includes(city)) {
      return NextResponse.json({ error: 'توهان کي هن شهر جي اجازت ناهي' }, { status: 403 });
    }
    if (!city || !allowed.includes(city)) {
      return NextResponse.json({ error: 'مهرباني ڪري پنهنجو شهر چونڊيو' }, { status: 400 });
    }
  }

  const admin = supabaseAdmin();
  const { data, error: dbError } = await admin
    .from('cms_posts')
    .insert({
      title,
      body: content,
      image: image || '',
      city: city || '',
      category: category || 'local',
      author_id: user.id,
      published: true,
    })
    .select('id, title, created_at')
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ post: data });
}
