import { redirect } from 'next/navigation';

// Old query-string links (/article?u=...) now redirect to the clean permalink.
export default function ArticleRedirect({ searchParams }) {
  const token = searchParams?.u || '';
  const native = searchParams?.n === '1';
  if (!token) redirect('/');
  redirect(`/article/khabar/${token}${native ? '?n=1' : ''}`);
}
