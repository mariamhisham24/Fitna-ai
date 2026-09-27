import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
let url = "", key = "";
env.split("\n").forEach((l) => {
  const trimmed = l.trim();
  if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) url = trimmed.split("=")[1].trim();
  if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) key = trimmed.split("=")[1].trim();
});

const sb = createClient(url, key);

function computeTeacherTalkRatio(events) {
  const teacherMs = events
    .filter((e) => e.event_type === "teacher_utterance")
    .reduce((sum, e) => {
      const meta = e.metadata;
      if (typeof meta?.duration_ms === "number" && meta.duration_ms > 0) return sum + meta.duration_ms;
      if (typeof meta?.speech_duration_ms === "number" && meta.speech_duration_ms > 0) return sum + meta.speech_duration_ms;
      const wordCount = (e.content ?? "").trim().split(/\s+/).filter(Boolean).length;
      return sum + Math.max(1800, wordCount * 450);
    }, 0);

  const studentMs = events
    .filter((e) => e.event_type === "student_response")
    .reduce((sum, e) => {
      const meta = e.metadata;
      if (typeof meta?.duration_ms === "number" && meta.duration_ms > 0) return sum + meta.duration_ms;
      const wordCount = (e.content ?? "").trim().split(/\s+/).filter(Boolean).length;
      return sum + Math.max(1500, wordCount * 380);
    }, 0);

  const totalSpokenMs = teacherMs + studentMs;
  if (totalSpokenMs === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((teacherMs / totalSpokenMs) * 100)));
}

function computeOverallScore(params) {
  const talkRatioScore = 100 - Math.abs(50 - params.teacherTalkRatio) * 2;
  const blended =
    Math.max(0, talkRatioScore) * 0.3 +
    params.socraticQuestionRate * 0.4 +
    params.inclusivityIndex * 0.3;
  return Math.round(Math.max(0, Math.min(100, blended)));
}

async function main() {
  const { data: sessions, error } = await sb.from("sessions").select("*").eq("status", "completed");
  if (error) {
    console.error("Error fetching sessions:", error);
    return;
  }
  console.log("Found completed sessions:", sessions.length);

  for (const session of sessions) {
    const { data: events } = await sb.from("session_events").select("*").eq("session_id", session.id);
    if (!events || events.length === 0) continue;

    const teacherUtterances = events.filter((e) => e.event_type === "teacher_utterance");
    if (teacherUtterances.length === 0) continue;

    const newRatio = computeTeacherTalkRatio(events);
    const socraticRate = session.socratic_question_rate ?? 0;
    const inclusivity = session.inclusivity_index ?? 0;
    const newScore = computeOverallScore({
      teacherTalkRatio: newRatio,
      socraticQuestionRate: socraticRate,
      inclusivityIndex: inclusivity,
    });

    console.log(
      `Session ${session.id.slice(0, 8)}: oldRatio=${session.teacher_talk_ratio}% -> newRatio=${newRatio}%, oldScore=${session.overall_score} -> newScore=${newScore}`
    );

    await sb
      .from("sessions")
      .update({
        teacher_talk_ratio: newRatio,
        overall_score: newScore,
      })
      .eq("id", session.id);

    // Also update report texts if it contained old 'صفر بالمائة' or '0%'
    const { data: report } = await sb.from("reports").select("id, summary_ar, strengths").eq("session_id", session.id).maybeSingle();
    if (report && report.summary_ar && (report.summary_ar.includes("صفر بالمائة") || report.summary_ar.includes("0%"))) {
      let updatedSummary = report.summary_ar
        .replace(/نسبة حديث معلم صفر بالمائة/g, `نسبة حديث معلم ${newRatio}%`)
        .replace(/صفر بالمائة/g, `${newRatio}%`)
        .replace(/ثمانية وخمسين من مئة/g, `${newScore} من مئة`);
      
      let updatedStrengths = (report.strengths || []).map((s) =>
        s.replace(/نسبة حديث معلم منخفضة للغاية/g, `نسبة حديث معلم بلغت ${newRatio}%`)
      );

      await sb.from("reports").update({
        summary_ar: updatedSummary,
        strengths: updatedStrengths,
      }).eq("id", report.id);

      console.log(`Updated report text for session ${session.id.slice(0, 8)}`);
    }
  }

  console.log("All past sessions and reports updated successfully!");
}

main();
