import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import React from 'react'
import InterviewCard from "@/components/InterviewCard"
import { getCurrentUser } from "@/lib/actions/auth.action"
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action"
import { redirect } from "next/navigation";
import DashboardDrawer from "@/components/DashboardDrawer";

// Dummy interviews for "Take an Interview" when no real ones exist
const dummyInterviews: Interview[] = [
  {
    id: "dummy-1",
    role: "Frontend Developer",
    type: "Technical",
    level: "Junior",
    techstack: ["React", "TypeScript", "CSS"],
    questions: [],
    userId: "dummy",
    finalized: true,
    // coverImage: "/covers/1.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dummy-2",
    role: "Backend Engineer",
    type: "Behavioural",
    level: "Mid-Level",
    techstack: ["Node.js", "Python", "MongoDB"],
    questions: [],
    userId: "dummy",
    finalized: true,
    // coverImage: "/covers/2.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dummy-3",
    role: "Fullstack Developer",
    type: "Mixed",
    level: "Senior",
    techstack: ["Next.js", "PostgreSQL", "Docker"],
    questions: [],
    userId: "dummy",
    finalized: true,
    // coverImage: "/covers/3.png",
    createdAt: new Date().toISOString(),
  },
];


// const page = async () => {

//   const user = await getCurrentUser();

//     if (!user) {
//     redirect("/sign-in");
//   }


//   const [userInterviews, latestInterviews] = await Promise.all([
//     getInterviewsByUserId(user.id),
//     getLatestInterviews({ userId: user.id })
//   ]);

//   const hasPastInterviews = (userInterviews ?? []).length > 0;
//   const hasUpcomingInterviews = (latestInterviews ?? []).length > 0;


//   return (
//     <>
//       <section className="card-cta" >
//         <div className="flex flex-col gap-6 max-w-lg">
//           <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
//           <p className="text-lg ">
//             Practice real interview questions & get instant feedback.
//           </p>

//           <Button asChild className="btn-primary max-sm:w-full">
//             <Link href="/interview">Start an Interview</Link>
//           </Button>
//         </div>

//         <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden"/>
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Your Interviews</h2>

//         <div className="interviews-section">
//           {
//             hasPastInterviews ? (
//               userInterviews?.map((interview) => (
//                 <InterviewCard {...interview} key={interview.id} />
//               ))
//             ) : (
//               <p>You haven't taken any interviews yet.</p>
//             ) 
//           }

//           {/* <p>You haven't taken any interview yet.</p> */}
//         </div>
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Take an Interview</h2>

//         <div className="interviews-section">
//           {
//             hasUpcomingInterviews ? (
//               latestInterviews?.map((interview) => (
//                 <InterviewCard {...interview} key={interview.id} />
//               ))
//             ) : (
//               <p>There are no new interviews available.</p>
//             ) 
//           }
//         </div>
//       </section>
//     </>
//   )
// }

const features = [
  {
    icon: "🎙️",
    title: "AI Voice Interviews",
    desc: "Practice with a real-time AI interviewer that speaks and listens — just like a real interview.",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    icon: "🛡️",
    title: "Smart Proctoring",
    desc: "Advanced face & object detection ensures integrity during every interview session.",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    icon: "📊",
    title: "Detailed Feedback",
    desc: "Get scored across 5 skill categories with strengths, weaknesses, and actionable tips.",
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  {
    icon: "🏆",
    title: "Track Progress",
    desc: "Monitor your improvement over time with score history, streaks, and achievement badges.",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
  },
];
 
// const stats = [
//   { value: "5+", label: "Skill Categories", icon: "🎯" },
//   { value: "AI", label: "Powered Feedback", icon: "🤖" },
//   { value: "100%", label: "Voice Based", icon: "🎤" },
//   { value: "Live", label: "Proctoring", icon: "🛡️" },
// ];
 
const page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
 
  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id })
  ]);
 
  const hasPastInterviews = (userInterviews ?? []).length > 0;
  const interviewsToShow = (latestInterviews ?? []).length > 0 ? latestInterviews : dummyInterviews;
 
  return (
    <>
      {/* Dashboard Button */}
      {/* <DashboardDrawer userId={user.id} userName={user.name || "User"} /> */}
 
      {/* ── HERO SECTION ── */}
      <section className="card-cta relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)", transform: "translateY(50%)" }} />
 
        <div className="flex flex-col gap-5 max-w-lg relative z-10">
          <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.25)" }}>
            ✨ AI-Powered Interview Practice
          </div>
          <h2 className="text-white text-3xl font-bold leading-snug">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)" }} className="text-base">
            Practice real interview questions, get instant AI feedback, and track your progress — all in one place.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild className="btn-primary max-sm:w-full"
              style={{ background: "white", color: "#7c3aed", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <Link href="/interview">🎤 Start an Interview</Link>
            </Button>
          </div>
        </div>
 
        <Image src="/robot.png" alt="robo-dude" width={380} height={380}
          className="max-sm:hidden relative z-10 drop-shadow-2xl" />
      </section>
 
      {/* ── STATS STRIP ── */}
      {/* <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1 py-5 px-4 rounded-2xl text-center"
            style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span className="text-2xl">{s.icon}</span>
            <span className="text-2xl font-bold text-slate-900">{s.value}</span>
            <span className="text-xs text-slate-500 font-medium">{s.label}</span>
          </div>
        ))}
      </section> */}
 
      {/* ── HOW IT WORKS ── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">How It Works</p>
          <h2 className="text-2xl font-bold text-slate-900">Prepare smarter, not harder</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: f.bg, border: `1.5px solid ${f.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "white", boxShadow: `0 4px 12px ${f.color}20` }}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">{f.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
              <div className="mt-auto pt-2">
                <div className="h-0.5 rounded-full w-8" style={{ background: f.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── YOUR INTERVIEWS ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Your History</p>
            <h2 className="text-2xl font-bold text-slate-900">Your Interviews</h2>
          </div>
          {hasPastInterviews && (
            <div className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
              {userInterviews?.length} total
            </div>
          )}
        </div>
 
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} userId={user.id} userImage="/user-avatar.png" />
            ))
          ) : (
            <div className="w-full py-14 flex flex-col items-center gap-3 rounded-2xl"
              style={{ background: "white", border: "1.5px dashed #ddd6fe" }}>
              <span className="text-4xl">🎤</span>
              <p className="font-semibold text-slate-700">No interviews yet</p>
              <p className="text-sm text-slate-400 text-center max-w-xs">
                Start your first AI interview to see your results here.
              </p>
              <Link href="/interview"
                className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                Start Now →
              </Link>
            </div>
          )}
        </div>
      </section>
 
      {/* ── TAKE AN INTERVIEW ── */}
      <section className="flex flex-col gap-5 pb-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Practice</p>
          <h2 className="text-2xl font-bold text-slate-900">Take an Interview</h2>
        </div>
        <div className="interviews-section">
          {interviewsToShow?.map((interview) => (
            <InterviewCard {...interview} key={interview.id} userId={user.id} />
          ))}
        </div>
      </section>
    </>
  )
}
export default page