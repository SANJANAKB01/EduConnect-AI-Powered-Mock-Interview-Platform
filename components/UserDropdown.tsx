'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardDrawer from './DashboardDrawer'
import ReportButton from './ReportButton'

interface UserDropdownProps {
  name: string
  email: string
  initials: string
  userId: string
}

export default function UserDropdown({ name, email, initials, userId }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
          style={{ background: open ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
            {initials}
          </div>
          <span className="text-sm font-medium text-slate-700 max-sm:hidden">{name.split(" ")[0]}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="max-sm:hidden transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
            style={{ background: "white", border: "1.5px solid #ede9fe", boxShadow: "0 8px 32px rgba(124,58,237,0.12), 0 2px 8px rgba(0,0,0,0.06)", animation: "dropIn 0.15s ease-out" }}>
            
            {/* User info header */}
            <div className="px-4 py-4 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", borderBottom: "1px solid #ddd6fe" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            </div>

            <div className="p-2">
              {/* Dashboard */}
              <button
                onClick={() => { setOpen(false); setDashboardOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                  📊
                </div>
                Dashboard
              </button>

              {/* Settings */}
              <Link href="/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                Settings
              </Link>

              <div className="my-1.5 mx-2" style={{ height: "1px", background: "#f1f5f9" }} />
              {/* Download Report — sits right here inside dropdown */}
              <div className="px-3 py-2">
                <ReportButton userId={userId} userName={name} />
              </div>
 
              <div className="my-1.5 mx-2" style={{ height: "1px", background: "#f1f5f9" }} />

              {/* Sign Out */}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fff1f2" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                Sign Out
              </button>
            </div>
          </div>
        )}
        <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
      </div>

      {/* Dashboard Modal — controlled from dropdown */}
      <DashboardDrawer
        userId={userId}
        userName={name}
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
      />
      
    </>
  )
}