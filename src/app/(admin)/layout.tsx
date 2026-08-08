import { AdminAuthGuard } from "@/components/layout/AdminAuthGuard";
import { AdminShell } from "@/components/layout/AdminShell";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminAuthGuard>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGuard>
    </ToastProvider>
  );
}
