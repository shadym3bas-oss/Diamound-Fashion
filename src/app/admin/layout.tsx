import AuthGuard from '@/components/auth-guard';
import DashboardLayout from '@/components/dashboard-layout';

export default function AdminAreaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
