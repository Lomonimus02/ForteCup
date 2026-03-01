import { getCurrentUser } from "@/lib/auth";
import { Bell } from "lucide-react";

export default async function AdminTopbar() {
  const user = await getCurrentUser();

  return (
    <header className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6">
      {/* Left: breadcrumb placeholder */}
      <div className="lg:pl-0 pl-12">
        <span className="text-sm text-neutral-500 uppercase tracking-wider">
          Панель управления
        </span>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">
              {user?.name ?? "Admin"}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
