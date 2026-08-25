'use client'
import { useState } from "react";

interface ReportButtonProps {
  userId: string;
  userName: string;
}

export default function ReportButton({ userId, userName }: ReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setError("No interviews found yet!");
        } else {
          setError(data.error || "Failed. Please try again.");
        }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EduConnect_Report_${userName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <style>{`@keyframes rbSpin { to { transform: rotate(360deg) } }`}</style>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #ddd6fe",
          background: loading ? "#f5f3ff" : "linear-gradient(135deg, #faf5ff, #eff6ff)",
          color: "#7c3aed",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          if (!loading) e.currentTarget.style.background = "#ede9fe";
        }}
        onMouseLeave={e => {
          if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #faf5ff, #eff6ff)";
        }}
      >
        {/* Icon box — matches other items */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: "#f5f3ff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {loading ? (
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              border: "2px solid #ddd6fe", borderTopColor: "#7c3aed",
              animation: "rbSpin 0.75s linear infinite",
            }} />
          ) : (
            <span style={{ fontSize: 15 }}>📄</span>
          )}
        </div>

        <div>
          <div>{loading ? "Generating…" : "Download Report"}</div>
          {loading && (
            <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 400, marginTop: 1 }}>
              AI analysing • ~15 sec
            </div>
          )}
        </div>
      </button>

      {error && (
        <p style={{
          margin: "6px 0 0", fontSize: 10, color: "#b91c1c",
          background: "#fef2f2", border: "1px solid #fecaca",
          padding: "4px 10px", borderRadius: 6, textAlign: "center",
        }}>
          {error}
        </p>
      )}
    </div>
  );
}