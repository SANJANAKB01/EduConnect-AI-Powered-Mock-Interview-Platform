// 'use client'

// import { useState, useEffect } from "react";
// import { getDashboardStats, DashboardStats } from "@/lib/actions/general.action";

// interface DashboardDrawerProps {
//   userId: string;
//   userName: string;
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// const RadarChart = ({ skills }: { skills: { name: string; score: number }[] }) => {
//   const size = 210;
//   const center = size / 2;
//   const radius = 78;
//   const levels = 4;
//   const total = skills.length;
//   const angleStep = (2 * Math.PI) / total;

//   const getCoords = (angle: number, r: number) => ({
//     x: center + r * Math.cos(angle - Math.PI / 2),
//     y: center + r * Math.sin(angle - Math.PI / 2),
//   });

//   const gridPolygons = Array.from({ length: levels }, (_, i) => {
//     const r = (radius / levels) * (i + 1);
//     return skills.map((_, j) => {
//       const { x, y } = getCoords(j * angleStep, r);
//       return `${x},${y}`;
//     }).join(" ");
//   });

//   const dataPoints = skills.map((s, i) => {
//     const r = (Math.max(s.score, 5) / 100) * radius; // min 5 so it's visible
//     const { x, y } = getCoords(i * angleStep, r);
//     return `${x},${y}`;
//   }).join(" ");

//   const shortNames: Record<string, string> = {
//     "Communication Skills": "Comm.",
//     "Technical Knowledge": "Tech.",
//     "Problem Solving": "Problem",
//     "Cultural Fit": "Culture",
//     "Confidence and Clarity": "Confid.",
//   };

//   const getSkillColor = (score: number) => {
//     if (score >= 80) return "#22c55e";
//     if (score >= 60) return "#eab308";
//     return "#6366f1";
//   };

//   return (
//     <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//       {gridPolygons.map((pts, i) => (
//         <polygon key={i} points={pts} fill="none"
//           stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
//       ))}
//       {skills.map((_, i) => {
//         const { x, y } = getCoords(i * angleStep, radius);
//         return <line key={i} x1={center} y1={center} x2={x} y2={y}
//           stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
//       })}
//       <polygon points={dataPoints} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
//       {skills.map((s, i) => {
//         const r = (Math.max(s.score, 5) / 100) * radius;
//         const { x, y } = getCoords(i * angleStep, r);
//         return (
//           <circle key={i} cx={x} cy={y} r="4"
//             fill={getSkillColor(s.score)} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
//         );
//       })}
//       {skills.map((s, i) => {
//         const { x, y } = getCoords(i * angleStep, radius + 20);
//         return (
//           <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
//             fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="sans-serif">
//             {shortNames[s.name] || s.name}
//           </text>
//         );
//       })}
//     </svg>
//   );
// };

// const LineChart = ({ data }: { data: { date: string; score: number }[] }) => {
//   if (data.length === 0) return (
//     <div className="flex items-center justify-center h-24 text-gray-500 text-xs">
//       No score history yet
//     </div>
//   );

//   const width = 480;
//   const height = 100;
//   const padding = { left: 30, right: 10, top: 10, bottom: 22 };
//   const chartW = width - padding.left - padding.right;
//   const chartH = height - padding.top - padding.bottom;

//   const minScore = Math.max(0, Math.min(...data.map(d => d.score)) - 10);
//   const maxScore = Math.min(100, Math.max(...data.map(d => d.score)) + 10);
//   const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;
//   const scaleY = (s: number) =>
//     padding.top + chartH - ((s - minScore) / (maxScore - minScore || 1)) * chartH;

//   const points = data.map((d, i) => ({
//     x: padding.left + i * xStep,
//     y: scaleY(d.score),
//     ...d,
//   }));

//   const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
//   const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

//   const getLineColor = (score: number) => score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#6366f1";

//   return (
//     <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
//       <defs>
//         <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor="#6366f1" />
//           <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
//         </linearGradient>
//       </defs>
//       <path d={areaD} fill="url(#areaGrad)" opacity="0.3" />
//       <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
//       {points.map((p, i) => (
//         <g key={i}>
//           <circle cx={p.x} cy={p.y} r="4" fill={getLineColor(p.score)}
//             stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
//           {i % Math.ceil(points.length / 6) === 0 && (
//             <text x={p.x} y={height - 5} textAnchor="middle"
//               fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="sans-serif">
//               {p.date}
//             </text>
//           )}
//         </g>
//       ))}
//       {[minScore, Math.round((minScore + maxScore) / 2), maxScore].map((v, i) => (
//         <text key={i} x={padding.left - 4} y={scaleY(v) + 3}
//           textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="sans-serif">
//           {Math.round(v)}
//         </text>
//       ))}
//     </svg>
//   );
// };

// export default function DashboardDrawer({ userId, userName }: DashboardDrawerProps) {
//   const [open, setOpen] = useState(false);
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (open && !stats) {
//       setLoading(true);
//       getDashboardStats(userId).then(setStats).finally(() => setLoading(false));
//     }
//   }, [open, userId, stats]);

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, []);

//   const getScoreColor = (score: number) => {
//     if (score >= 80) return "#22c55e";
//     if (score >= 60) return "#eab308";
//     return "#ef4444";
//   };

//   const getScoreLabel = (score: number) => {
//     if (score >= 80) return "Excellent";
//     if (score >= 60) return "Good";
//     if (score >= 40) return "Average";
//     return "Needs Work";
//   };

//   const getScoreBg = (score: number) => {
//     if (score >= 80) return "rgba(34,197,94,0.12)";
//     if (score >= 60) return "rgba(234,179,8,0.12)";
//     return "rgba(239,68,68,0.12)";
//   };

//   return (
//     <>
//       {/* Trigger Button */}
//       <button
//         onClick={() => setOpen(true)}
//         className="fixed top-5 right-5 z-40 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
//         style={{
//           background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
//           boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
//           color: "white",
//         }}
//       >
//         <span>📊</span>
//         <span>Dashboard</span>
//       </button>

//       {/* Backdrop + Modal */}
//       {open && (
//         <div
//           className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
//           onClick={() => setOpen(false)}
//         >
//           <div
//             className="relative w-[82%] max-h-[88vh] rounded-3xl overflow-hidden flex flex-col"
//             style={{
//               background: "linear-gradient(160deg, #0d0d1c 0%, #080810 100%)",
//               border: "1px solid rgba(99,102,241,0.2)",
//               boxShadow: "0 30px 90px rgba(0,0,0,0.95), 0 0 0 1px rgba(99,102,241,0.08)",
//               animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
//             }}
//             onClick={e => e.stopPropagation()}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between px-8 py-5 shrink-0"
//               style={{ background: "rgba(13,13,28,0.98)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
//                   style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
//                   📊
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-white">My Dashboard</h2>
//                   <p className="text-xs text-gray-500 mt-0.5">Welcome back, {userName.split(" ")[0]} 👋</p>
//                 </div>
//               </div>
//               <button onClick={() => setOpen(false)}
//                 className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg">
//                 ✕
//               </button>
//             </div>

//             {/* Body */}
//             <div className="overflow-y-auto flex-1">
//               {loading ? (
//                 <div className="flex flex-col items-center justify-center h-64 gap-3">
//                   <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//                   <p className="text-gray-500 text-sm">Loading your stats...</p>
//                 </div>
//               ) : stats ? (
//                 <div className="p-7 grid grid-cols-2 gap-6">

//                   {/* ── LEFT COLUMN ── */}
//                   <div className="flex flex-col gap-5">

//                     {/* Stat Cards */}
//                     <div className="grid grid-cols-3 gap-3">
//                       {[
//                         { label: "Total", value: stats.totalInterviews, icon: "🎤", suffix: "", color: "#6366f1" },
//                         { label: "Average", value: stats.averageScore, icon: "📈", suffix: "/100", color: getScoreColor(stats.averageScore) },
//                         { label: "Best", value: stats.bestScore, icon: "🏆", suffix: "/100", color: getScoreColor(stats.bestScore) },
//                       ].map((s, i) => (
//                         <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-1"
//                           style={{
//                             background: i === 0 ? "rgba(99,102,241,0.1)" : getScoreBg(s.value as number),
//                             border: `1px solid ${s.color}30`,
//                           }}>
//                           <span className="text-2xl">{s.icon}</span>
//                           <span className="text-2xl font-bold" style={{ color: s.color }}>
//                             {s.value}{s.suffix}
//                           </span>
//                           <span className="text-xs text-gray-500">{s.label}</span>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Streak + Performance */}
//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="rounded-2xl p-4 flex items-center gap-3"
//                         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
//                         <span className="text-3xl">🔥</span>
//                         <div>
//                           <p className="text-xl font-bold text-white">{stats.streak} day{stats.streak !== 1 ? "s" : ""}</p>
//                           <p className="text-xs text-gray-500">Current streak</p>
//                         </div>
//                       </div>
//                       <div className="rounded-2xl p-4 flex items-center gap-3"
//                         style={{
//                           background: getScoreBg(stats.averageScore),
//                           border: `1px solid ${getScoreColor(stats.averageScore)}30`,
//                         }}>
//                         <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
//                           style={{ background: `${getScoreColor(stats.averageScore)}20`, color: getScoreColor(stats.averageScore) }}>
//                           {stats.averageScore}
//                         </div>
//                         <div>
//                           <p className="text-sm font-bold text-white">{getScoreLabel(stats.averageScore)}</p>
//                           <p className="text-xs text-gray-500">Performance</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Score Progress */}
//                     <div className="rounded-2xl p-5"
//                       style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
//                       <h3 className="text-sm font-semibold text-white mb-3">📈 Score Progress</h3>
//                       <LineChart data={stats.scoreHistory} />
//                     </div>

//                     {/* Recent Activity */}
//                     <div className="rounded-2xl p-5"
//                       style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
//                       <h3 className="text-sm font-semibold text-white mb-3">📅 Recent Activity</h3>
//                       {stats.recentInterviews.length === 0 ? (
//                         <p className="text-xs text-gray-500 text-center py-4">No interviews yet</p>
//                       ) : (
//                         <div className="flex flex-col">
//                           {stats.recentInterviews.map((iv, i) => (
//                             <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
//                               <div className="flex items-center gap-3">
//                                 <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
//                                   style={{ background: "rgba(99,102,241,0.12)" }}>
//                                   {iv.type === "Technical" ? "⚙️" : iv.type === "Behavioural" ? "🗣️" : "🔀"}
//                                 </div>
//                                 <div>
//                                   <p className="text-xs font-medium text-white capitalize">{iv.role}</p>
//                                   <p className="text-xs text-gray-600">
//                                     {new Date(iv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                                   </p>
//                                 </div>
//                               </div>
//                               {iv.score !== null ? (
//                                 <span className="text-sm font-bold px-2 py-0.5 rounded-lg"
//                                   style={{
//                                     color: getScoreColor(iv.score),
//                                     background: getScoreBg(iv.score),
//                                   }}>
//                                   {iv.score}/100
//                                 </span>
//                               ) : (
//                                 <span className="text-xs text-gray-600">No feedback</span>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* ── RIGHT COLUMN ── */}
//                   <div className="flex flex-col gap-5">

//                     {/* Skill Radar */}
//                     <div className="rounded-2xl p-5"
//                       style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
//                       <h3 className="text-sm font-semibold text-white mb-3">🎯 Skill Radar</h3>
//                       <div className="flex items-center gap-5">
//                         <RadarChart skills={stats.skillScores} />
//                         <div className="flex flex-col gap-2.5 flex-1">
//                           {stats.skillScores.map((s, i) => (
//                             <div key={i}>
//                               <div className="flex justify-between text-xs mb-1">
//                                 <span className="text-gray-400">{s.name.replace(" Skills", "").replace(" Knowledge", "")}</span>
//                                 <span className="font-bold" style={{ color: getScoreColor(s.score) }}>{s.score}/100</span>
//                               </div>
//                               <div className="h-1.5 rounded-full bg-white/10">
//                                 <div className="h-1.5 rounded-full transition-all duration-700"
//                                   style={{ width: `${s.score}%`, background: getScoreColor(s.score) }} />
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     {/* 🛡️ Proctoring Summary — NEW */}
//                     <div className="rounded-2xl p-5"
//                       style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
//                       <h3 className="text-sm font-semibold text-white mb-4">🛡️ Proctoring Summary</h3>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="rounded-xl p-3 flex items-center gap-3"
//                           style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
//                           <span className="text-2xl">✅</span>
//                           <div>
//                             <p className="text-lg font-bold text-green-400">{stats.cleanInterviews ?? stats.totalInterviews}</p>
//                             <p className="text-xs text-gray-500">Clean</p>
//                           </div>
//                         </div>
//                         <div className="rounded-xl p-3 flex items-center gap-3"
//                           style={{
//                             background: stats.proctoringViolations > 0 ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
//                             border: stats.proctoringViolations > 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.07)",
//                           }}>
//                           <span className="text-2xl">{stats.proctoringViolations > 0 ? "🚨" : "🟢"}</span>
//                           <div>
//                             <p className="text-lg font-bold"
//                               style={{ color: stats.proctoringViolations > 0 ? "#ef4444" : "#22c55e" }}>
//                               {stats.proctoringViolations}
//                             </p>
//                             <p className="text-xs text-gray-500">Violations</p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="mt-3 rounded-xl p-3 flex items-center gap-2"
//                         style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
//                         <span className="text-base">📋</span>
//                         <p className="text-xs text-gray-400">
//                           {stats.proctoringViolations === 0
//                             ? "All interviews passed integrity check! 🎉"
//                             : `${stats.proctoringViolations} interview(s) flagged for suspicious activity.`}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Badges */}
//                     <div className="rounded-2xl p-5"
//                       style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
//                       <h3 className="text-sm font-semibold text-white mb-3">🏅 Achievements</h3>
//                       <div className="grid grid-cols-3 gap-3">
//                         {stats.badges.map((b) => (
//                           <div key={b.id}
//                             className="flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-300"
//                             style={{
//                               background: b.earned ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
//                               border: b.earned ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.05)",
//                               opacity: b.earned ? 1 : 0.35,
//                             }}>
//                             <span className="text-2xl" style={{ filter: b.earned ? "none" : "grayscale(1)" }}>
//                               {b.emoji}
//                             </span>
//                             <span className="text-xs text-center leading-tight"
//                               style={{ color: b.earned ? "#a5b4fc" : "#4b5563" }}>
//                               {b.label}
//                             </span>
//                             {b.earned && <span className="text-xs text-green-400">✓</span>}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <p className="text-center text-xs text-gray-700 pb-1">
//                       PrepWise Analytics • Keep improving! 🚀
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
//                   No data found
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes modalIn {
//           from { opacity: 0; transform: scale(0.9) translateY(24px); }
//           to   { opacity: 1; transform: scale(1)   translateY(0);    }
//         }
//       `}</style>
//     </>
//   );
// }
// 
'use client'
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getDashboardStats, DashboardStats } from "@/lib/actions/general.action";

interface DashboardDrawerProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const RadarChart = ({ skills }: { skills: { name: string; score: number }[] }) => {
  if (!skills || skills.length === 0) return null;
  const size = 190;
  const cx = size / 2, cy = size / 2, r = 68;
  const total = skills.length;

  const getPoint = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const outerPoints = skills.map((_, i) => getPoint(i, r));
  const dataPoints = skills.map((s, i) => getPoint(i, (Math.min(s.score, 100) / 100) * r));
  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  const shortName = (name: string) => {
    const map: Record<string, string> = {
      "Communication Skills": "Comm.",
      "Technical Knowledge": "Tech.",
      "Problem Solving": "Problem",
      "Cultural Fit": "Culture",
      "Confidence and Clarity": "Clarity",
    };
    return map[name] || (name.length > 9 ? name.slice(0, 9) + "…" : name);
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon key={ring}
          points={outerPoints.map((p) => {
            const dx = p.x - cx, dy = p.y - cy;
            return `${(cx + dx * ring).toFixed(1)},${(cy + dy * ring).toFixed(1)}`;
          }).join(" ")}
          fill={ring === 1 ? "rgba(124,58,237,0.03)" : "none"}
          stroke="#e5e7eb" strokeWidth="1"
        />
      ))}
      {outerPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />
      ))}
      <path d={toPath(dataPoints)} fill="rgba(124,58,237,0.12)" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7c3aed" stroke="white" strokeWidth="1.5" />
      ))}
      {outerPoints.map((p, i) => {
        const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
        return (
          <text key={i}
            x={(cx + (r + 19) * Math.cos(angle)).toFixed(1)}
            y={(cy + (r + 19) * Math.sin(angle)).toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill="#6b7280" fontWeight="500" fontFamily="sans-serif">
            {shortName(skills[i].name)}
          </text>
        );
      })}
    </svg>
  );
};

const ScoreLineChart = ({ scores }: { scores: { date: string; score: number }[] }) => {
  if (!scores || scores.length < 2) return (
    <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af", fontSize: 11, margin: 0 }}>Complete more interviews to see trend</p>
    </div>
  );
  const w = 300, h = 72, padX = 6, padY = 10;
  const max = Math.max(...scores.map(s => s.score), 100);
  const min = Math.max(0, Math.min(...scores.map(s => s.score)) - 10);
  const toX = (i: number) => padX + (i / (scores.length - 1)) * (w - padX * 2);
  const toY = (v: number) => padY + (1 - (v - min) / (max - min)) * (h - padY * 2);
  const pathD = scores.map((s, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(s.score).toFixed(1)}`).join(" ");
  const areaD = pathD + ` L ${toX(scores.length - 1).toFixed(1)} ${h} L ${toX(0).toFixed(1)} ${h} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#dg)" />
      <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {scores.map((s, i) => (
        <circle key={i} cx={toX(i)} cy={toY(s.score)} r="3" fill="#7c3aed" stroke="white" strokeWidth="1.5" />
      ))}
      <text x={toX(0)} y={h} textAnchor="middle" fontSize="7.5" fill="#9ca3af">
        {new Date(scores[0].date).toLocaleDateString("en", { month: "short", day: "numeric" })}
      </text>
      <text x={toX(scores.length - 1)} y={h} textAnchor="middle" fontSize="7.5" fill="#9ca3af">
        {new Date(scores[scores.length - 1].date).toLocaleDateString("en", { month: "short", day: "numeric" })}
      </text>
    </svg>
  );
};

export default function DashboardDrawer({ userId, userName, isOpen, onClose }: DashboardDrawerProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mount check for portal
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getDashboardStats(userId).then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, [userId, isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const scoreStyle = (score: number) => {
    if (score >= 70) return { bg: "#f0fdf4", border: "#86efac", text: "#15803d", pill: "#dcfce7" };
    if (score >= 40) return { bg: "#fffbeb", border: "#fcd34d", text: "#b45309", pill: "#fef3c7" };
    return { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", pill: "#fee2e2" };
  };

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const modal = (
    <>
      <style>{`
        @keyframes db-fade { from { opacity:0 } to { opacity:1 } }
        @keyframes db-up {
          from { opacity:0; transform:translate(-50%,-50%) translateY(20px) scale(0.97) }
          to   { opacity:1; transform:translate(-50%,-50%) translateY(0)     scale(1)    }
        }
        @keyframes db-spin { to { transform:rotate(360deg) } }
        #db-scroll::-webkit-scrollbar { width:5px }
        #db-scroll::-webkit-scrollbar-track { background:transparent }
        #db-scroll::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:10px }
      `}</style>

      {/* Backdrop — attached directly to document.body via portal */}
      <div
        id="db-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "rgba(2,6,23,0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 2147483647, // max z-index
          animation: "db-fade 0.2s ease",
        }}
      />

      {/* Modal — also fixed, centered with transform trick */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2147483647,
          width: "min(92vw, 980px)",
          height: "min(88vh, 760px)",
          background: "#ffffff",
          borderRadius: 22,
          boxShadow: "0 40px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "db-up 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: "16px 22px",
          background: "linear-gradient(135deg,#faf5ff,#eff6ff)",
          borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: 14,
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
                {userName}'s Dashboard
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                Interview performance overview
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              padding: "3px 11px", borderRadius: 20,
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.15)",
              fontSize: 10, color: "#7c3aed", fontWeight: 600,
            }}>
              📊 Live Stats
            </span>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #e5e7eb", background: "white",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6b7280", fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#6b7280"; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div id="db-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                border: "3px solid #e5e7eb", borderTopColor: "#7c3aed",
                animation: "db-spin 0.75s linear infinite",
              }} />
              <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>Loading your stats…</p>
            </div>
          ) : !stats ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
              <span style={{ fontSize: 44 }}>📊</span>
              <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>Complete an interview to see your stats!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%" }}>

              {/* LEFT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* 4 stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {[
                    { label: "Total Interviews", value: String(stats.totalInterviews), icon: "🎯", sc: null },
                    { label: "Current Streak",   value: `${stats.streak ?? 0}d`,       icon: "🔥", sc: null },
                    { label: "Average Score",    value: String(stats.averageScore),     sub: "/100", icon: "📈", sc: scoreStyle(stats.averageScore) },
                    { label: "Best Score",       value: String(stats.bestScore),        sub: "/100", icon: "🏆", sc: scoreStyle(stats.bestScore) },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "12px 14px", borderRadius: 13,
                      background: item.sc?.bg ?? "#f9fafb",
                      border: `1px solid ${item.sc?.border ?? "#e5e7eb"}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      transition: "transform .15s, box-shadow .15s",
                      cursor: "default",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: item.sc?.text ?? "#111827" }}>
                          {item.value}
                        </span>
                        {item.sub && <span style={{ fontSize: 11, color: item.sc?.text ?? "#6b7280", opacity: 0.7 }}>{item.sub}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3, fontWeight: 500 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Score Progress */}
                <div style={{ padding: "14px 16px", borderRadius: 13, background: "#fafafa", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>📈</span> Score Progress
                  </p>
                  <ScoreLineChart scores={stats.scoreHistory} />
                </div>

                {/* Recent Activity */}
                <div style={{ padding: "14px 16px", borderRadius: 13, background: "#fafafa", border: "1px solid #e5e7eb", flex: 1 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>🕒</span> Recent Activity
                  </p>
                  {stats.recentInterviews.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 11, textAlign: "center", padding: "14px 0", margin: 0 }}>No interviews yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {stats.recentInterviews.slice(0, 5).map((item, i) => {
                        const sc = item.score !== null ? scoreStyle(item.score) : { bg: "#f9fafb", border: "#e5e7eb", text: "#6b7280", pill: "#f3f4f6" };
                        return (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "8px 11px", borderRadius: 10,
                            background: "white", border: "1px solid #f3f4f6",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: "linear-gradient(135deg,#ede9fe,#dbeafe)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                              }}>🎤</div>
                              <div>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>{item.role}</p>
                                <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>
                                  {new Date(item.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                              background: sc.pill, color: sc.text, border: `1px solid ${sc.border}`,
                            }}>
                              {item.score ?? "—"}/100
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Skill Radar */}
                <div style={{ padding: "14px 16px", borderRadius: 13, background: "#fafafa", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>🕸️</span> Skill Radar
                  </p>
                  {stats.skillScores.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flexShrink: 0 }}>
                        <RadarChart skills={stats.skillScores} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        {stats.skillScores.map((s, i) => {
                          const sc = scoreStyle(s.score);
                          const short: Record<string, string> = {
                            "Communication Skills": "Communication",
                            "Technical Knowledge": "Technical",
                            "Problem Solving": "Problem Solving",
                            "Cultural Fit": "Cultural Fit",
                            "Confidence and Clarity": "Confidence",
                          };
                          return (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 500 }}>{short[s.name] || s.name}</span>
                                <span style={{ fontSize: 9.5, fontWeight: 700, color: sc.text }}>{s.score}</span>
                              </div>
                              <div style={{ height: 4, borderRadius: 99, background: "#f3f4f6", overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", borderRadius: 99,
                                  width: `${s.score}%`,
                                  background: s.score >= 70 ? "linear-gradient(90deg,#22c55e,#16a34a)"
                                    : s.score >= 40 ? "linear-gradient(90deg,#f59e0b,#d97706)"
                                    : "linear-gradient(90deg,#ef4444,#b91c1c)",
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: 11, textAlign: "center", padding: "18px 0", margin: 0 }}>
                      Complete interviews to see skill breakdown
                    </p>
                  )}
                </div>

                {/* Proctoring */}
                <div style={{ padding: "14px 16px", borderRadius: 13, background: "#fafafa", border: "1px solid #e5e7eb" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>🛡️</span> Proctoring Summary
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    {[
                      {
                        icon: "✅",
                        value: stats.cleanInterviews ?? Math.max(0, stats.totalInterviews - (stats.proctoringViolations ?? 0)),
                        label: "Clean",
                        bg: "#f0fdf4", border: "#86efac", iconBg: "#dcfce7",
                        valColor: "#15803d", labelColor: "#16a34a",
                      },
                      {
                        icon: (stats.proctoringViolations ?? 0) > 0 ? "🚨" : "✅",
                        value: stats.proctoringViolations ?? 0,
                        label: "Violations",
                        bg: (stats.proctoringViolations ?? 0) > 0 ? "#fef2f2" : "#f0fdf4",
                        border: (stats.proctoringViolations ?? 0) > 0 ? "#fca5a5" : "#86efac",
                        iconBg: (stats.proctoringViolations ?? 0) > 0 ? "#fee2e2" : "#dcfce7",
                        valColor: (stats.proctoringViolations ?? 0) > 0 ? "#b91c1c" : "#15803d",
                        labelColor: (stats.proctoringViolations ?? 0) > 0 ? "#dc2626" : "#16a34a",
                      },
                    ].map((c, i) => (
                      <div key={i} style={{
                        padding: "11px 13px", borderRadius: 11,
                        background: c.bg, border: `1px solid ${c.border}`,
                        display: "flex", alignItems: "center", gap: 9,
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                          {c.icon}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 21, fontWeight: 800, color: c.valColor, lineHeight: 1 }}>{c.value}</p>
                          <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: c.labelColor, marginTop: 2 }}>{c.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 9, padding: "8px 11px", borderRadius: 9,
                    background: (stats.proctoringViolations ?? 0) === 0 ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${(stats.proctoringViolations ?? 0) === 0 ? "#bbf7d0" : "#fecaca"}`,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 12 }}>{(stats.proctoringViolations ?? 0) === 0 ? "🎉" : "⚠️"}</span>
                    <p style={{
                      margin: 0, fontSize: 10, fontWeight: 500,
                      color: (stats.proctoringViolations ?? 0) === 0 ? "#15803d" : "#b91c1c",
                    }}>
                      {(stats.proctoringViolations ?? 0) === 0
                        ? "All interviews passed integrity check!"
                        : `${stats.proctoringViolations} interview(s) flagged for suspicious activity.`}
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                <div style={{ padding: "14px 16px", borderRadius: 13, background: "#fafafa", border: "1px solid #e5e7eb", flex: 1 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>🏅</span> Achievements
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                    {[
                      { label: "First Interview", emoji: "🎯", earned: stats.totalInterviews >= 1 },
                      { label: "5 Interviews",    emoji: "🔥", earned: stats.totalInterviews >= 5 },
                      { label: "10 Interviews",   emoji: "💪", earned: stats.totalInterviews >= 10 },
                      { label: "Score 70+",       emoji: "⭐", earned: stats.bestScore >= 70 },
                      { label: "Score 90+",       emoji: "🏆", earned: stats.bestScore >= 90 },
                      { label: "5 Day Streak",    emoji: "⚡", earned: (stats.streak ?? 0) >= 5 },
                    ].map((a, i) => (
                      <div key={i} style={{
                        padding: "10px 5px", borderRadius: 10, textAlign: "center",
                        background: a.earned ? "white" : "#f9fafb",
                        border: `1px solid ${a.earned ? "#ddd6fe" : "#f3f4f6"}`,
                        opacity: a.earned ? 1 : 0.42,
                        boxShadow: a.earned ? "0 2px 8px rgba(124,58,237,0.08)" : "none",
                        transition: "transform .15s",
                        cursor: "default",
                      }}
                        onMouseEnter={e => { if (a.earned) e.currentTarget.style.transform = "scale(1.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4, filter: a.earned ? "none" : "grayscale(1)" }}>{a.emoji}</div>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 600, lineHeight: 1.3, color: a.earned ? "#4b5563" : "#9ca3af" }}>{a.label}</p>
                        {a.earned && <p style={{ margin: "3px 0 0", fontSize: 9, color: "#7c3aed", fontWeight: 700 }}>✓</p>}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: "12px 22px", borderTop: "1px solid #f3f4f6", background: "#fafafa",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}> EduConnect Analytics • Keep improving ✨</p>
          <button
            onClick={onClose}
            style={{
              padding: "7px 20px", borderRadius: 8,
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              border: "none", color: "white",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 3px 10px rgba(124,58,237,0.3)",
              transition: "opacity .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );

  // createPortal renders directly into document.body — bypasses ALL parent stacking contexts
  return createPortal(modal, document.body);
}