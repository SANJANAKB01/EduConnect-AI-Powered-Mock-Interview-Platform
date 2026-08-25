'use client'
import { useState } from "react";
import jsPDF from "jspdf";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface FeedbackDownloadButtonProps {
  candidateName: string;
  role: string;
  totalScore: number;
  createdAt: string;
  finalAssessment?: string;
  categoryScores?: CategoryScore[];
  strengths?: string[];
  areasForImprovement?: string[];
}

export default function FeedbackDownloadButton({
  candidateName,
  role,
  totalScore,
  createdAt,
  finalAssessment,
  categoryScores,
  strengths,
  areasForImprovement,
}: FeedbackDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const getScoreLabel = (score: number) =>
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs Work";

  const getScoreColor = (score: number): [number, number, number] =>
    score >= 80 ? [16, 185, 129] : score >= 60 ? [245, 158, 11] : [244, 63, 94];

  const handleDownload = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 0;

      // ── HEADER BANNER ──
      doc.setFillColor(109, 40, 217); // violet-700
      doc.rect(0, 0, pageW, 48, "F");

      // Subtle diagonal accent
      doc.setFillColor(124, 58, 237);
      doc.triangle(pageW - 60, 0, pageW, 0, pageW, 60, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Interview Feedback Report", margin, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Candidate: ${candidateName}`, margin, 30);
      doc.text(`Role: ${role.charAt(0).toUpperCase() + role.slice(1)} Interview`, margin, 37);
      doc.text(`Date: ${createdAt}`, margin, 44);

      y = 60;

      // ── SCORE CARD ──
      const [sr, sg, sb] = getScoreColor(totalScore);
      const scoreBgR = sr + Math.round((255 - sr) * 0.85);
      const scoreBgG = sg + Math.round((255 - sg) * 0.85);
      const scoreBgB = sb + Math.round((255 - sb) * 0.85);

      doc.setFillColor(scoreBgR, scoreBgG, scoreBgB);
      doc.roundedRect(margin, y, contentW, 32, 4, 4, "F");
      doc.setDrawColor(sr, sg, sb);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentW, 32, 4, 4, "S");

      // Score circle
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 20, y + 16, 13, "F");
      doc.setDrawColor(sr, sg, sb);
      doc.setLineWidth(1.5);
      doc.circle(margin + 20, y + 16, 13, "S");

      doc.setTextColor(sr, sg, sb);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${totalScore}`, margin + 20, y + 14, { align: "center" });
      doc.setFontSize(7);
      doc.text("/100", margin + 20, y + 20, { align: "center" });

      doc.setTextColor(30, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Overall Score: ${totalScore}/100`, margin + 40, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(sr, sg, sb);
      doc.text(getScoreLabel(totalScore), margin + 40, y + 22);

      y += 42;

      // ── FINAL ASSESSMENT ──
      if (finalAssessment) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 60);
        doc.text("Final Assessment", margin, y);
        y += 6;

        doc.setFillColor(248, 250, 255);
        const assessmentLines = doc.splitTextToSize(finalAssessment, contentW - 10);
        const assessmentH = assessmentLines.length * 5 + 10;
        doc.roundedRect(margin, y, contentW, assessmentH, 3, 3, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentW, assessmentH, 3, 3, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(assessmentLines, margin + 5, y + 7);
        y += assessmentH + 10;
      }

      // ── CATEGORY BREAKDOWN ──
      if (categoryScores && categoryScores.length > 0) {
        // Check if we need a new page
        if (y > pageH - 80) { doc.addPage(); y = 20; }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 60);
        doc.text("Breakdown of the Interview", margin, y);
        y += 8;

        for (const cat of categoryScores) {
          const [cr, cg, cb] = getScoreColor(cat.score);
          const catBgR = cr + Math.round((255 - cr) * 0.9);
          const catBgG = cg + Math.round((255 - cg) * 0.9);
          const catBgB = cb + Math.round((255 - cb) * 0.9);

          const commentLines = doc.splitTextToSize(cat.comment || "", contentW - 14);
          const cardH = commentLines.length * 4.5 + 22;

          if (y + cardH > pageH - 20) { doc.addPage(); y = 20; }

          doc.setFillColor(catBgR, catBgG, catBgB);
          doc.roundedRect(margin, y, contentW, cardH, 3, 3, "F");
          doc.setDrawColor(cr, cg, cb);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, y, contentW, cardH, 3, 3, "S");

          // Category name
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(30, 30, 60);
          doc.text(cat.name, margin + 5, y + 8);

          // Score badge
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(pageW - margin - 22, y + 3, 20, 8, 2, 2, "F");
          doc.setTextColor(cr, cg, cb);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`${cat.score}/100`, pageW - margin - 12, y + 8.5, { align: "center" });

          // Progress bar
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(margin + 5, y + 12, contentW - 27, 2.5, 1, 1, "F");
          doc.setFillColor(cr, cg, cb);
          doc.roundedRect(margin + 5, y + 12, (contentW - 27) * (cat.score / 100), 2.5, 1, 1, "F");

          // Comment
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(commentLines, margin + 5, y + 19);

          y += cardH + 5;
        }
      }

      // ── STRENGTHS ──
      if (strengths && strengths.length > 0) {
        if (y > pageH - 60) { doc.addPage(); y = 20; }

        const strLines = strengths.map(s => doc.splitTextToSize(`• ${s}`, contentW - 14));
        const totalStrLines = strLines.reduce((a, b) => a + b.length, 0);
        const strBoxH = totalStrLines * 5 + 16;

        doc.setFillColor(236, 253, 245);
        doc.roundedRect(margin, y, contentW, strBoxH, 4, 4, "F");
        doc.setDrawColor(167, 243, 208);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentW, strBoxH, 4, 4, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(6, 78, 59);
        doc.text("Strengths", margin + 5, y + 9);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(4, 120, 87);
        let sy = y + 16;
        for (const lines of strLines) {
          doc.text(lines, margin + 7, sy);
          sy += lines.length * 5;
        }
        y += strBoxH + 8;
      }

      // ── AREAS FOR IMPROVEMENT ──
      if (areasForImprovement && areasForImprovement.length > 0) {
        if (y > pageH - 60) { doc.addPage(); y = 20; }

        const impLines = areasForImprovement.map(a => doc.splitTextToSize(`• ${a}`, contentW - 14));
        const totalImpLines = impLines.reduce((a, b) => a + b.length, 0);
        const impBoxH = totalImpLines * 5 + 16;

        doc.setFillColor(255, 247, 237);
        doc.roundedRect(margin, y, contentW, impBoxH, 4, 4, "F");
        doc.setDrawColor(254, 215, 170);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentW, impBoxH, 4, 4, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(124, 45, 18);
        doc.text("Areas for Improvement", margin + 5, y + 9);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(154, 52, 18);
        let iy = y + 16;
        for (const lines of impLines) {
          doc.text(lines, margin + 7, iy);
          iy += lines.length * 5;
        }
        y += impBoxH + 8;
      }

      // ── FOOTER ──
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(245, 243, 255);
        doc.rect(0, pageH - 12, pageW, 12, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(109, 40, 217);
        doc.text("EduConnect — AI Mock Interview Platform", margin, pageH - 4);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 4, { align: "right" });
      }

      const fileName = `${candidateName.replace(/\s+/g, "_")}_${role.replace(/\s+/g, "_")}_Feedback.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download Feedback as PDF"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        borderRadius: "10px",
        background: loading ? "#ede9fe" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
        color: loading ? "#7c3aed" : "#ffffff",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "13px",
        fontWeight: 600,
        boxShadow: loading ? "none" : "0 2px 8px rgba(109,40,217,0.25)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => {
        if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      {loading ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Generating...
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}