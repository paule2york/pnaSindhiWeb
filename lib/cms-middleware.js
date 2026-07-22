import { NextResponse } from 'next/server';

// Helper to check auth in API routes
import { getUserFromToken, getTokenFromRequest } from './cms-auth';

export async function requireAuth(request, allowedRoles = null) {
  const token = getTokenFromRequest(request);
  const user = await getUserFromToken(token);

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null };
  }

  return { error: null, user };
}
