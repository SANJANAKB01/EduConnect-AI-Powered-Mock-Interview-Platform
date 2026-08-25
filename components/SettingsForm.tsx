'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserProfile } from "@/lib/actions/settings.action"
interface SettingsFormProps {
  userId: string
  userName: string
  userEmail: string
}

export default function SettingsForm({ userId, userName, userEmail }: SettingsFormProps) {
  const [name, setName] = useState(userName)
  const [displayName, setDisplayName] = useState(userName.split(" ")[0])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const router = useRouter()

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage(null)
    const result = await updateUserProfile(userId, { name })
    setSaving(false)
    setMessage({ text: result.message, ok: result.success })
    if (result.success) router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Profile Info */}
      <Section title="Profile Information" icon="👤" description="Update your personal details">
        <Field label="Full Name">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none transition-all"
            style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }} />
        </Field>
        <Field label="Email Address">
          <input type="email" value={userEmail} disabled
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#94a3b8" }} />
        </Field>
        <Field label="Display Name">
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none"
            style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }} />
        </Field>
        {message && (
          <p className={`text-sm font-medium ${message.ok ? "text-emerald-600" : "text-red-500"}`}>
            {message.ok ? "✅" : "❌"} {message.text}
          </p>
        )}
        <SaveBtn onClick={handleSaveProfile} loading={saving} />
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon="🔒" description="Keep your account secure">
        <Field label="Current Password"><input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }} /></Field>
        <Field label="New Password"><input type="password" placeholder="Min 8 characters" className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }} /></Field>
        <Field label="Confirm New Password"><input type="password" placeholder="Repeat new password" className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }} /></Field>
        <SaveBtn label="Update Password" />
      </Section>

      {/* Interview Preferences */}
      <Section title="Interview Preferences" icon="🎯" description="Customize your default interview settings">
        <div className="grid grid-cols-2 gap-4">
          {[["Default Role", ["Software Engineer","Frontend Developer","Backend Engineer","Data Scientist","DevOps Engineer"]],
            ["Default Level", ["Entry","Junior","Mid-Level","Senior"]],
            ["Preferred Type", ["Technical","Behavioural","Mixed"]],
            ["Questions per Session", ["3","5","7","10"]]
          ].map(([label, options]) => (
            <Field key={label as string} label={label as string}>
              <select className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }}>
                {(options as string[]).map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          ))}
        </div>
        <SaveBtn label="Save Preferences" />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon="🔔" description="Manage your notification preferences">
        <div className="flex flex-col gap-1">
          {[
            ["Interview Reminders", "Get reminded to practice daily", true],
            ["Score Milestones", "Notify when you reach a new high score", true],
            ["Streak Alerts", "Alert when your streak is about to break", true],
            ["New Features", "Updates about new platform features", false],
            ["Weekly Report", "Weekly summary of your performance", true],
          ].map(([label, desc, on]) => (
            <ToggleRow key={label as string} label={label as string} desc={desc as string} defaultOn={on as boolean} />
          ))}
        </div>
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security" icon="🛡️" description="Control your data and privacy">
        <div className="flex flex-col gap-1">
          <ToggleRow label="Proctoring Always On" desc="Enable camera proctoring for all interviews" defaultOn />
          <ToggleRow label="Share Interview Data" desc="Allow anonymized data for AI improvement" />
          <ToggleRow label="Two-Factor Authentication" desc="Extra security for your account" />
        </div>
        <div className="mt-4 p-4 rounded-2xl flex items-center justify-between" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }}>
          <div><p className="text-sm font-semibold text-slate-800">Active Sessions</p><p className="text-xs text-slate-500 mt-0.5">1 device currently signed in</p></div>
          <button className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>Sign Out All</button>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon="🎨" description="Personalize your experience">
        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Light", icon: "☀️", active: true }, { label: "Dark", icon: "🌙", active: false }, { label: "System", icon: "💻", active: false }].map(theme => (
            <button key={theme.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105"
              style={{ background: theme.active ? "#f5f3ff" : "white", border: theme.active ? "2px solid #7c3aed" : "1.5px solid #e2e8f0" }}>
              <span className="text-2xl">{theme.icon}</span>
              <span className="text-xs font-semibold" style={{ color: theme.active ? "#7c3aed" : "#64748b" }}>{theme.label}</span>
              {theme.active && <span className="text-xs text-violet-600 font-bold">✓ Active</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#fff1f2", border: "1.5px solid #fecdd3" }}>
        <div><h3 className="font-bold text-red-700 flex items-center gap-2"><span>⚠️</span> Danger Zone</h3><p className="text-sm text-red-400 mt-0.5">These actions are irreversible. Please be careful.</p></div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white" style={{ border: "1px solid #fecdd3" }}>
            <div><p className="text-sm font-semibold text-slate-800">Clear Interview History</p><p className="text-xs text-slate-500">Delete all your past interviews and feedback</p></div>
            <button className="text-xs font-semibold text-orange-500 px-3 py-1.5 rounded-lg" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>Clear Data</button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white" style={{ border: "1px solid #fecdd3" }}>
            <div><p className="text-sm font-semibold text-slate-800">Delete Account</p><p className="text-xs text-slate-500">Permanently remove your account and all data</p></div>
            <button className="text-xs font-semibold text-red-500 px-3 py-1.5 rounded-lg" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>Delete</button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 pb-4">EduConnect v1.0 • Your data is safe with us 🔒</p>
    </div>
  )
}

const Section = ({ title, icon, description, children }: { title: string; icon: string; description: string; children: React.ReactNode }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
    <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #f1f5f9", background: "#fafbff" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#f5f3ff" }}>{icon}</div>
      <div><p className="font-semibold text-slate-900 text-sm">{title}</p><p className="text-xs text-slate-400">{description}</p></div>
    </div>
    <div className="p-6 flex flex-col gap-4">{children}</div>
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
    {children}
  </div>
)

const ToggleRow = ({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setOn(!on)}>
      <div><p className="text-sm font-medium text-slate-800">{label}</p><p className="text-xs text-slate-400 mt-0.5">{desc}</p></div>
      <div className="relative w-11 h-6 rounded-full transition-colors shrink-0" style={{ background: on ? "#7c3aed" : "#e2e8f0" }}>
        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }} />
      </div>
    </div>
  )
}

const SaveBtn = ({ label = "Save Changes", onClick, loading }: { label?: string; onClick?: () => void; loading?: boolean }) => (
  <button onClick={onClick} disabled={loading}
    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-60"
    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
    {loading ? "Saving..." : label}
  </button>
)