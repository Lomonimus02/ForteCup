import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | FORTE CUP",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login имеет собственный полноэкранный layout — без sidebar
  return <>{children}</>;
}
