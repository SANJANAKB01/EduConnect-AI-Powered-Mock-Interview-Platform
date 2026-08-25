
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";

const SettingsPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initials = user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-16">
      <div className="flex items-center gap-4">
        <Link href="/" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-violet-600 transition-colors font-bold text-lg"
          style={{ background: "white", border: "1.5px solid #e2e8f0" }}>←</Link>
        <div>
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Account</p>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-3xl p-8 flex items-center gap-6"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #4f46e5 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.25)" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
          style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)" }}>
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-white text-xl font-bold">{user.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }} className="text-sm mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>✓ Verified Account</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>🎤 Active Member</span>
          </div>
        </div>
      </div>

      {/* All settings sections — client component handles saves */}
      <SettingsForm userId={user.id} userName={user.name} userEmail={user.email} />
    </div>
  );
};

export default SettingsPage;