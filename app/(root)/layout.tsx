
import UserDropdown from "@/components/UserDropdown"
import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import React, { ReactNode } from 'react'

const RootLayout = async ({ children } : {children: ReactNode}) => {

  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();
  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
 
//   
return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 40%, #faf5ff 100%)" }}>
      <nav className="sticky top-0 z-30 w-full"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 1px 20px rgba(124,58,237,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8 max-sm:px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
              <Image src="/logo.svg" alt="Logo" width={20} height={20} className="brightness-0 invert" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-slate-900">Edu</span><span style={{ color: "#7c3aed" }}>Connect</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/interview"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95 max-sm:hidden"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}>
              <span>🎤</span><span>Start Interview</span>
            </Link>
            <UserDropdown
              name={user?.name || "User"}
              email={user?.email || ""}
              initials={initials}
              userId={user?.id || ""}
            />
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-8 max-sm:px-4 py-10 flex flex-col gap-12">
        {children}
      </div>
    </div>
  )
}
 
export default RootLayout