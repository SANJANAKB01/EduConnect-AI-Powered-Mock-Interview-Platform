import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import jsPDF from "jspdf";

export async function POST(req: NextRequest) {
  try {
    const { userId, userName } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // ── 1. Fetch all feedback for this user ──
    const feedbackSnap = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (feedbackSnap.empty) {
      return NextResponse.json({ error: "No feedback found" }, { status: 404 });
    }

    const feedbacks = feedbackSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Fetch interview details
    const interviewIds = [...new Set(feedbacks.map((f) => f.interviewId).filter(Boolean))];
    const interviewMap: Record<string, any> = {};

    await Promise.all(
      interviewIds.map(async (id) => {
        const snap = await db.collection("interviews").doc(id).get();
        if (snap.exists) interviewMap[id] = snap.data();
      })
    );

    // ── 2. Build data summary ──
    const totalInterviews = feedbacks.length;
    const cleanFeedbacks = feedbacks.filter((f) => !f.cheating);
    const cheatingCount = feedbacks.filter((f) => f.cheating).length;
    const scores = cleanFeedbacks.map((f) => f.totalScore || 0).filter((s) => s > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const worstScore = scores.length ? Math.min(...scores) : 0;

    const skillTotals: Record<string, { total: number; count: number }> = {};
    cleanFeedbacks.forEach((f) => {
      (f.categoryScores || []).forEach((cs: any) => {
        if (!skillTotals[cs.name]) skillTotals[cs.name] = { total: 0, count: 0 };
        skillTotals[cs.name].total += cs.score;
        skillTotals[cs.name].count += 1;
      });
    });
    const skillAverages = Object.entries(skillTotals).map(([name, { total, count }]) => ({
      name,
      avg: Math.round(total / count),
    }));

    const allStrengths = cleanFeedbacks.flatMap((f) => f.strengths || []);
    const allWeaknesses = cleanFeedbacks.flatMap((f) => f.areasForImprovement || []);

    const timeline = feedbacks.slice(0, 10).map((f) => {
      const interview = interviewMap[f.interviewId] || {};
      return {
        date: f.createdAt?.split("T")[0] || "Unknown",
        role: interview.role || "Unknown",
        type: interview.type || "Unknown",
        score: f.cheating ? "TERMINATED" : (f.totalScore || 0),
        cheating: f.cheating || false,
      };
    });

    // ── 3. AI Analysis via Groq ──
    const prompt = `
      You are an expert career coach. Analyze this data and write a JSON report.
      CANDIDATE: ${userName}
      INTERVIEWS: ${totalInterviews} | CLEAN: ${cleanFeedbacks.length} | TERMINATED: ${cheatingCount}
      AVG SCORE: ${avgScore}/100 | BEST: ${bestScore} | WORST: ${worstScore}
      SKILLS: ${skillAverages.map((s) => `${s.name}: ${s.avg}`).join(", ")}
      STRENGTHS: ${allStrengths.slice(0, 5).join(", ")}
      WEAKNESSES: ${allWeaknesses.slice(0, 5).join(", ")}

      Return ONLY valid JSON with these keys:
      {
        "executiveSummary": "2 paragraphs",
        "performanceLevel": "Beginner/Developing/Proficient/Advanced/Expert",
        "keyStrengths": ["s1", "s2", "s3"],
        "criticalWeaknesses": ["w1", "w2"],
        "actionPlan": ["a1", "a2", "a3", "a4"],
        "finalVerdict": "1 paragraph"
      }`;

    const aiResponse = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
      maxTokens: 1500,
      temperature: 0.7,
    });

    let analysis: any = {};
    try {
      const raw = aiResponse.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      analysis = { executiveSummary: "Could not generate.", performanceLevel: "Developing", keyStrengths: [], criticalWeaknesses: [], actionPlan: [], finalVerdict: "Keep practicing!" };
    }

    // ── 4. Generate PDF using jsPDF ──
    const doc = new jsPDF();
    let y = 20;

    // Helper to add text and handle page breaks
    const addText = (text: string, size: number = 12, isBold: boolean = false) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 15, y);
      y += lines.length * (size * 0.5);
    };

    // Title
    doc.setTextColor(30, 58, 138);
    addText("EduConnect Interview Report", 24, true);
    doc.setTextColor(0, 0, 0);
    y += 5;
    addText(`Candidate: ${userName}`, 14, true);
    addText(`Generated: ${new Date().toLocaleString()}`, 10);
    y += 5;

    // Stats Box
    doc.setFillColor(240, 245, 255);
    doc.rect(15, y, 180, 35, 'F');
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${totalInterviews}`, 25, y);
    doc.text(`Avg Score: ${avgScore}/100`, 80, y);
    doc.text(`Level: ${analysis.performanceLevel}`, 140, y);
    y += 10;
    doc.text(`Best: ${bestScore}`, 25, y);
    doc.text(`Worst: ${worstScore}`, 80, y);
    doc.text(`Terminated: ${cheatingCount}`, 140, y);
    y += 15;

    // Content
    addText("Executive Summary", 16, true); y += 2;
    addText(analysis.executiveSummary || "N/A", 11); y += 5;

    addText("Key Strengths", 14, true); y += 2;
    (analysis.keyStrengths || []).forEach((s: string) => { addText(`• ${s}`, 11); }); y += 3;

    addText("Areas for Improvement", 14, true); y += 2;
    (analysis.criticalWeaknesses || []).forEach((w: string) => { addText(`• ${w}`, 11); }); y += 3;

    addText("Action Plan", 14, true); y += 2;
    (analysis.actionPlan || []).forEach((a: string, i: number) => { addText(`${i + 1}. ${a}`, 11); }); y += 5;

    addText("Final Verdict", 14, true); y += 2;
    addText(analysis.finalVerdict || "N/A", 11);

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="EduConnect_Report_${userName.replace(/\s+/g, "_")}.pdf"`,
      },
    });

  } catch (err: any) {
    console.error("Report error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}