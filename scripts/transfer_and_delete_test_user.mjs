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

const TEST_USER_ID = "e948bbf0-0a93-46dd-9b01-b85f229477dd";
const DEMO_USER_ID = "d3300000-0000-4000-8000-000000000001";

async function transferAndDelete() {
  console.log("Starting migration from test@fitna.ai to demo@fitna.ai...");

  // 1. Transfer sessions
  const { data: updatedSessions, error: sessionErr } = await sb
    .from("sessions")
    .update({ teacher_id: DEMO_USER_ID })
    .eq("teacher_id", TEST_USER_ID)
    .select("id");

  if (sessionErr) {
    console.error("Error migrating sessions:", sessionErr);
  } else {
    console.log(`Successfully transferred ${updatedSessions?.length ?? 0} sessions to demo@fitna.ai!`);
  }

  // 2. Transfer badges
  const { data: badges } = await sb.from("badges").select("*").eq("user_id", TEST_USER_ID);
  if (badges && badges.length > 0) {
    for (const b of badges) {
      await sb.from("badges").upsert(
        { user_id: DEMO_USER_ID, badge_key: b.badge_key, session_id: b.session_id },
        { onConflict: "user_id,badge_key", ignoreDuplicates: true }
      );
    }
    await sb.from("badges").delete().eq("user_id", TEST_USER_ID);
    console.log(`Transferred ${badges.length} badges to demo@fitna.ai.`);
  }

  // 3. Transfer cohort_teachers if any
  try {
    const { error: cohortErr } = await sb
      .from("cohort_teachers")
      .update({ teacher_id: DEMO_USER_ID })
      .eq("teacher_id", TEST_USER_ID);
    if (!cohortErr) console.log("Transferred cohort_teachers.");
  } catch {}

  // 4. Delete user from public.users
  const { error: delPublicErr } = await sb.from("users").delete().eq("id", TEST_USER_ID);
  if (delPublicErr) {
    console.error("Error deleting from public.users:", delPublicErr);
  } else {
    console.log("Successfully deleted test@fitna.ai from public.users.");
  }

  // 5. Delete user from auth.users
  const { error: delAuthErr } = await sb.auth.admin.deleteUser(TEST_USER_ID);
  if (delAuthErr) {
    console.error("Error deleting from auth.users:", delAuthErr);
  } else {
    console.log("Successfully deleted test@fitna.ai from auth.users.");
  }

  // 6. Verify demo account totals
  const { count: totalDemoSessions } = await sb
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", DEMO_USER_ID);

  console.log(`Migration complete! Total sessions now under demo@fitna.ai: ${totalDemoSessions}`);
}

transferAndDelete();
