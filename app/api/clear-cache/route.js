import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export const maxDuration = 120;

export async function GET() {
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });

  try {
    const { data, error } = await admin.from('translations').delete().neq('hash', '');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: data?.length || 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
