import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

const SALT_ROUNDS = 10;

// Hash a password
export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Compare plain text with hash
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Generate a random hex token
function randomToken() {
  return [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Simple hex SHA-256 (no external deps)
async function sha256(msg) {
  const buf = new TextEncoder().encode(msg);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hashBuf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Create a session for a user
export async function createSession(userId) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const admin = supabaseAdmin();
  if (!admin) return null;

  await admin.from('cms_sessions').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return token;
}

// Get user from a session token
export async function getUserFromToken(token) {
  if (!token) return null;
  const admin = supabaseAdmin();
  if (!admin) return null;

  const tokenHash = await sha256(token);

  const { data, error } = await admin
    .from('cms_sessions')
    .select('user_id, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  // Check expiry
  if (new Date(data.expires_at) < new Date()) return null;

  // Get user
  const { data: user } = await admin
    .from('cms_users')
    .select('id, email, name, role, allowed_cities, is_active')
    .eq('id', data.user_id)
    .maybeSingle();

  if (!user || !user.is_active) return null;

  return user;
}

// Delete a session (logout)
export async function deleteSession(token) {
  if (!token) return;
  const admin = supabaseAdmin();
  if (!admin) return;
  const tokenHash = await sha256(token);
  await admin.from('cms_sessions').delete().eq('token_hash', tokenHash);
}

// Get token from request cookies
export function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)cms_token=([^;]+)/);
  return match ? match[1] : null;
}
