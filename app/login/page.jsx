import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export const metadata = { title: 'Sign In — Dollar Commerce' };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/');

  return (
    <div style={{
      minHeight: '100vh', background: '#F4F1EA',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <LoginForm />
    </div>
  );
}
