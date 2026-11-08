import type { Metadata } from 'next';
import AdminProvider from '@/components/admin/AdminProvider';

export const metadata: Metadata = {
  title: 'Editor',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="flex-1 bg-white">
      <AdminProvider>{children}</AdminProvider>
    </div>
  );
}
