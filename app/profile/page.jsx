import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import ProfilePage from '@/components/ProfilePage';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getTopBarData } from '@/lib/topbar-data';

export const metadata = {
  title: 'Your Profile',
  description: 'Manage your Dollar Commerce account — saved articles, email preferences, and notification settings.',
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

async function getUserData(userId) {
  return sanityClient.fetch(
    `*[_type=="user" && _id==$userId][0]{
      _id, name, email, image, createdAt,
      notificationPrefs,
      "savedArticles": savedArticles[]->{
        _id, title, "slug": slug.current, publishedAt,
        "category": category->title,
        "author": author->name
      }
    }`,
    { userId }
  );
}

export default async function ProfileRoute() {
  const session = await auth();
  if (!session) redirect('/login');

  const [userData, topBar] = await Promise.all([
    getUserData(session.user.id),
    getTopBarData(),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SiteHeader dcIndexValue={topBar.dcIndexValue} dcIndexChange={topBar.dcIndexChange} latestArticle={topBar.latestArticle} />
      <ProfilePage session={session} userData={userData} />
      <SiteFooter />
    </div>
  );
}
