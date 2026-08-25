"use server";

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";  // ← change

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
      .collection('interviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {

    const { userId, limit = 20 } = params;

    const interviews = await db
      .collection('interviews')
      // .orderBy('createdAt', 'desc')
      .where('finalized', '==', true)
      .where('userId', '!=', userId)
      .orderBy('userId')          // REQUIRED for !=
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewsById(id: string): Promise<Interview | null> {
    const interview = await db.collection('interviews').doc(id).get();

    return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try{
                // Cheating case — skip Groq, save directly
        if (params.cheating) {
          const feedbackRef = feedbackId
            ? db.collection("feedback").doc(feedbackId)
            : db.collection("feedback").doc();

          await feedbackRef.set({
            interviewId,
            userId,
            totalScore: 0,
            categoryScores: [],
            strengths: [],
            areasForImprovement: [],
            finalAssessment: "Interview terminated due to cheating.",
            createdAt: new Date().toISOString(),
            cheating: true,
            cheatingReason: params.cheatingReason ?? null,
          });

          return { success: true, feedbackId: feedbackRef.id };
        }
        const formattedTranscript = transcript.map((sentence: { role: string; content: string; }) => (
            `- ${sentence.role}: ${sentence.content}\n`
        )).join("");

    const { object } = await generateObject({
      model: groq("llama-3.1-8b-instant"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem Solving**: Ability to analyze problems and propose solutions.
        - **Cultural Fit**: Alignment with company values and job role.
        - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

const feedback = {
  interviewId: interviewId,
  userId: userId,
  totalScore: object.totalScore,
  categoryScores: object.categoryScores,
  strengths: object.strengths,
  areasForImprovement: object.areasForImprovement,
  finalAssessment: object.finalAssessment,
  createdAt: new Date().toISOString(),
  cheating: (params as any).cheating ?? false,
  cheatingReason: (params as any).cheatingReason ?? null,
};

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {

    const { interviewId, userId } = params;

    const feedback = await db.collection('feedback').where('interviewId', '==', interviewId).where('userId', '==', userId).limit(1).get();

    if(feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];

    return {
        id: feedbackDoc.id,
        ...feedbackDoc.data()
    } as Feedback;
}
// ─── NEW: Dashboard Stats ────────────────────────────────────────────────────
 
export interface DashboardStats {
    totalInterviews: number;
    averageScore: number;
    bestScore: number;
    recentInterviews: {
        id: string;
        role: string;
        type: string;
        score: number | null;
        date: string;
    }[];
    skillScores: {
        name: string;
        score: number;
    }[];
    scoreHistory: {
        date: string;
        score: number;
    }[];
    badges: {
        id: string;
        label: string;
        emoji: string;
        earned: boolean;
    }[];
    streak: number;
    proctoringViolations: number;
    cleanInterviews: number;
}
 
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    // Fetch interviews
    const interviewsSnap = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
 
    const interviews = interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Interview[];
 
    // Fetch feedback (no orderBy to avoid composite index requirement)
    const feedbackSnap = await db
        .collection('feedback')
        .where('userId', '==', userId)
        .get();
 
    const feedbacks = feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
 
    // Sort feedbacks by createdAt in memory
    feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
 
    // Build feedback map: interviewId → feedback
    const feedbackMap: Record<string, any> = {};
    feedbacks.forEach(f => { feedbackMap[f.interviewId] = f; });
 
    // Scores
    const scores = feedbacks.map(f => f.totalScore).filter((s): s is number => typeof s === 'number' && s > 0);
    const totalInterviews = interviews.length;
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
 
    // Recent 5 interviews
    const recentInterviews = interviews.slice(0, 5).map(iv => ({
        id: iv.id,
        role: iv.role,
        type: iv.type,
        score: feedbackMap[iv.id]?.totalScore ?? null,
        date: iv.createdAt,
    }));
 
    // ── Skill averages — normalize category names before matching ──
    const SKILL_KEYS = [
        "Communication Skills",
        "Technical Knowledge",
        "Problem Solving",
        "Cultural Fit",
        "Confidence and Clarity",
    ];
 
    // Normalize: strip punctuation/extra spaces, lowercase for comparison
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "").trim();
 
    const normalizedKeys: Record<string, string> = {};
    SKILL_KEYS.forEach(k => { normalizedKeys[normalize(k)] = k; });
 
    const skillTotals: Record<string, number[]> = {};
    SKILL_KEYS.forEach(k => { skillTotals[k] = []; });
 
    feedbacks.forEach(f => {
        (f.categoryScores ?? []).forEach((cat: any) => {
            const normalized = normalize(cat.name ?? "");
            const matched = normalizedKeys[normalized];
            if (matched && typeof cat.score === 'number') {
                skillTotals[matched].push(cat.score);
            }
        });
    });
 
    const skillScores = SKILL_KEYS.map(name => ({
        name,
        score: skillTotals[name].length > 0
            ? Math.round(skillTotals[name].reduce((a, b) => a + b, 0) / skillTotals[name].length)
            : 0,
    }));
 
    // Score history (chronological, last 10)
    const scoreHistory = [...feedbacks]
        .filter(f => typeof f.totalScore === 'number' && f.createdAt)
        .slice(0, 10)
        .reverse()
        .map(f => ({
            date: new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: f.totalScore,
        }));
 
    // Streak — consecutive days with interviews
    let streak = 0;
    if (interviews.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const interviewDates = [...new Set(interviews.map(iv => {
            const d = new Date(iv.createdAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        }))].sort((a, b) => b - a);
 
        for (let i = 0; i < interviewDates.length; i++) {
            const expected = today.getTime() - i * 86400000;
            if (Math.abs(interviewDates[i] - expected) < 86400000) streak++;
            else break;
        }
    }
 
    // Proctoring violations — check feedback for cheating flag
    const proctoringViolations = feedbacks.filter(f => f.cheating === true).length;
    const cleanInterviews = totalInterviews - proctoringViolations;
 
    // Badges
    const badges = [
        { id: "first",   label: "First Interview", emoji: "🎯", earned: totalInterviews >= 1 },
        { id: "five",    label: "5 Interviews",    emoji: "🔥", earned: totalInterviews >= 5 },
        { id: "ten",     label: "10 Interviews",   emoji: "💪", earned: totalInterviews >= 10 },
        { id: "score70", label: "Score 70+",       emoji: "⭐", earned: bestScore >= 70 },
        { id: "score90", label: "Score 90+",       emoji: "🏆", earned: bestScore >= 90 },
        { id: "streak3", label: "3-Day Streak",    emoji: "📅", earned: streak >= 3 },
    ];
 
    return {
        totalInterviews,
        averageScore,
        bestScore,
        recentInterviews,
        skillScores,
        scoreHistory,
        badges,
        streak,
        proctoringViolations,
        cleanInterviews,
    };
}