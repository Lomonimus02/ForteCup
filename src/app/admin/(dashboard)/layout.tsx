import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — FORTE CUP",
    default: "Admin — FORTE CUP",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <AdminTopbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
