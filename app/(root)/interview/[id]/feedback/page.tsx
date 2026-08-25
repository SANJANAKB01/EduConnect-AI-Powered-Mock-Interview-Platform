
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId, getInterviewsById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import React from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs";
import FeedbackDownloadButton from "@/components/FeedbackDownloadButton";

const page = async ({ params }: RouteParams) => {

  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewsById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const wasCaught = (feedback as any)?.cheating === true;
  const terminationReason = (feedback as any)?.cheatingReason || null;
  const getScoreColor = (score: number) => score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";
  const getScoreBg = (score: number) => score >= 80 ? "#ecfdf5" : score >= 60 ? "#fffbeb" : "#fff1f2";
  const getScoreLabel = (score: number) => score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs Work";
  const totalScore = wasCaught ? 0 : (feedback?.totalScore ?? 0);
  const formattedDate = feedback?.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A") : "N/A";

  return (
    <section className="section-feedback py-12">

      {/* ── CHEATING BANNER ── */}
      {wasCaught && (
        <div className="w-full rounded-2xl p-6" style={{ background: "#fff1f2", border: "1.5px solid #fecdd3" }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#ffe4e6" }}>🚫</div>
            <div>
              <h2 className="text-red-600 font-bold text-xl">Interview Terminated</h2>
              <p className="text-red-400 text-sm">Cheating detected by proctoring system</p>
            </div>
          </div>
          {terminationReason && <p className="text-red-500 text-sm font-medium mb-3">Reason: {terminationReason}</p>}
          <div className="flex flex-wrap gap-2">
            {["⚠️ Incident recorded", "📹 Camera violation", "🔴 Score: 0/100"].map((t, i) => (
              <span key={i} className="text-xs text-red-500 px-3 py-1 rounded-full" style={{ background: "#ffe4e6", border: "1px solid #fecdd3" }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── TITLE ROW with Download Button (top-right, only for non-terminated) ── */}
      <div className="relative flex flex-col items-center text-center">
        <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-2">Interview Feedback</p>
        <h1 className="text-4xl font-bold text-slate-900 capitalize">{interview.role} Interview</h1>

        {/* Download button — top-right corner, only shown if NOT terminated */}
        {!wasCaught && (
          <div className="absolute right-0 top-1">
            <FeedbackDownloadButton
              candidateName={user?.name || "Candidate"}
              role={interview.role}
              totalScore={totalScore}
              createdAt={formattedDate}
              finalAssessment={feedback?.finalAssessment}
              categoryScores={feedback?.categoryScores}
              strengths={feedback?.strengths}
              areasForImprovement={feedback?.areasForImprovement}
            />
          </div>
        )}
      </div>

      {/* ── SCORE CARD ── */}
      <div className="rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-center gap-8" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg"
            style={{ background: getScoreBg(totalScore), border: `3px solid ${getScoreColor(totalScore)}` }}>
            <span className="text-3xl font-bold" style={{ color: getScoreColor(totalScore) }}>{totalScore}</span>
            <span className="text-xs text-slate-400 font-medium">/100</span>
          </div>
          <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: getScoreBg(totalScore), color: getScoreColor(totalScore) }}>
            {getScoreLabel(totalScore)}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-50"><Image src="/star.svg" width={18} height={18} alt="star" /></div>
            <div><p className="text-xs text-slate-400">Overall Score</p><p className="font-semibold text-slate-900">{totalScore}/100</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-50"><Image src="/calendar.svg" width={18} height={18} alt="calendar" /></div>
            <div><p className="text-xs text-slate-400">Date</p><p className="font-semibold text-slate-900">{formattedDate}</p></div>
          </div>
        </div>
      </div>

      {/* ── FEEDBACK CONTENT ── */}
      {wasCaught ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "#fff1f2", border: "1.5px solid #fecdd3" }}>
          <p className="text-red-500 font-semibold text-lg mb-2">No feedback available</p>
          <p className="text-slate-500 text-sm">This interview was terminated due to a proctoring violation. Please retake honestly.</p>
        </div>
      ) : (
        <>
          {feedback?.finalAssessment && (
            <div className="rounded-2xl p-6" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }}>
              <p className="text-slate-700 leading-relaxed">{feedback.finalAssessment}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-900">📊 Breakdown of the Interview</h2>
            <div className="grid gap-4">
              {feedback?.categoryScores?.map((category, index) => (
                <div key={index} className="rounded-2xl p-5" style={{ background: getScoreBg(category.score), border: `1.5px solid ${getScoreColor(category.score)}22` }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-slate-900">{index + 1}. {category.name}</p>
                    <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ color: getScoreColor(category.score), background: "white", border: `1.5px solid ${getScoreColor(category.score)}33` }}>{category.score}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-3" style={{ background: "#e2e8f0" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${category.score}%`, background: getScoreColor(category.score) }} />
                  </div>
                  <p className="text-sm text-slate-600">{category.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {feedback?.strengths && feedback.strengths.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "#ecfdf5", border: "1.5px solid #a7f3d0" }}>
              <h3 className="text-lg font-bold text-emerald-800 mb-4">✅ Strengths</h3>
              <ul className="flex flex-col gap-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-emerald-700 text-sm"><span className="mt-0.5 text-emerald-500">●</span>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback?.areasForImprovement && feedback.areasForImprovement.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
              <h3 className="text-lg font-bold text-orange-800 mb-4">🎯 Areas for Improvement</h3>
              <ul className="flex flex-col gap-2">
                {feedback.areasForImprovement.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-orange-700 text-sm"><span className="mt-0.5 text-orange-400">●</span>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* ── BUTTONS ── */}
      <div className="buttons pt-2">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center"><p className="text-sm font-semibold text-center">Back to Dashboard</p></Link>
        </Button>
        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center"><p className="text-sm font-semibold text-white text-center">Retake Interview</p></Link>
        </Button>
      </div>
    </section>
  );
};

export default page;