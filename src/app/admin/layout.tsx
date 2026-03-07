import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'ADMIN') {
    redirect('/tenant');
  }

  return (
    <DashboardLayout
      user={{
        name: session.email.split('@')[0],
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
