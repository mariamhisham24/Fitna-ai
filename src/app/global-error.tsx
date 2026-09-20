"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleDemoAccess = () => {
    document.cookie = "fitna_demo=true; path=/; max-age=31536000; SameSite=Lax";
    document.cookie = "theme=dark; path=/; max-age=31536000; SameSite=Lax";
    window.location.href = "/dashboard/teacher";
  };

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#071b3a", color: "#f6f0e4", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "480px", width: "100%", background: "#0b2548", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255, 181, 46, 0.25)", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>⚡</div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginBottom: "12px" }}>
              نعتذر، حدث خطأ في النظام
            </h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "24px" }}>
              يمكنك إعادة المحاولة أو تجربة المنصة مباشرة عبر الحساب التجريبي.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => reset()}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#ffb52e", color: "#071b3a", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
              >
                إعادة المحاولة
              </button>
              <button
                onClick={handleDemoAccess}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
              >
                دخول تجريبي فوري (بدون تسجيل)
              </button>
              <a
                href="/"
                style={{ color: "#64748b", fontSize: "13px", textDecoration: "none", marginTop: "8px" }}
              >
                العودة للصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}