import { redirect } from 'next/navigation';

// Legacy /article/<slug>/<token> links now redirect to the clean numeric permalink.
export default function LegacyArticleRedirect({ params, searchParams }) {
  const token = params?.token || '';
  const native = searchParams?.n === '1';
  if (!token) redirect('/');
  redirect(`/article/${token}${native ? '?n=1' : ''}`);
}
