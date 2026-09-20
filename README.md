# Fitna AI (فِطنة) — Milestone 1: Real Auth + Database + Role Isolation

This is **step 1 of 7** from the build plan (spec §7): a real, working
foundation — no mock data anywhere in what's built so far. Everything
below is either live database state or a genuine Supabase Auth session.

## What's actually working right now

- **Real signup/login/logout** via Supabase Auth (`src/app/(auth)/login/`)
  — passwords are hashed by Supabase itself (bcrypt under the hood), not
  stored anywhere in your own code.
- **Real password reset** email flow (`requestPasswordResetAction`).
- **Role selection at signup** (`teacher` / `institution_admin`) stored in
  `public.users.role`, auto-populated via a Postgres trigger the moment
  Supabase Auth creates the `auth.users` row (`supabase/schema.sql`).
- **Two entirely separate dashboards** — `/dashboard/teacher` and
  `/dashboard/institution` — each pulling live aggregate numbers from
  Postgres (average score, sessions this month, teacher count). No
  hardcoded 86/138/81.4-style numbers. If a teacher has zero completed
  sessions, they see a real empty state, not a fake zero.
- **Three-layer role isolation**, per spec §2.1:
  1. `src/proxy.ts` (Next's route middleware) redirects to `/unauthorized`
     before a mismatched-role page even renders.
  2. `supabase/schema.sql` — Row Level Security policies that make the
     *database itself* refuse cross-tenant reads, even if the middleware
     or a query filter had a bug.
  3. Explicit `.eq("teacher_id", user.id)` / `.eq("institution_id", ...)`
     filters in every query, using the server-authenticated `user.id` —
     never a client-supplied ID.
- **Logo component** (`src/components/Logo.tsx`) that switches
  dark/light automatically by section — currently a labeled placeholder
  since the two lockup PNGs didn't come through the upload; see the
  comment at the top of that file for how to drop in the real files.

## What's intentionally NOT built yet (next milestones)

Session setup, the live AI simulation room, STT/TTS, LLM-generated
reports, PDF export, share links, badges, and the full marketing
landing page all come in steps 2–7 of the original plan. Building them
now against an empty database would just be new mock data with extra
steps — better to get this foundation running for real first.

## Setup

### 1. Apply the database schema
Open your Supabase project → **SQL Editor** → paste the entire contents
of `supabase/schema.sql` → **Run**. This creates every table, the RLS
policies, the seed lesson topics, and the four student personas
(Omar/Sarah/Yassin/Nour) with real Egyptian-Arabic personality prompts.

### 2. Environment variables
`.env.local` is already filled in with the keys you gave me. **Rotate
the `service_role` key** in Supabase (Settings → API → regenerate) since
it was pasted in a chat — then update `.env.local` with the new one.
Never commit this file (already covered by `.gitignore`).

### 3. Run it
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`. Sign up, pick a role, and you'll land on
your real (currently near-empty) dashboard — that emptiness is correct
and honest, not a bug.

### 4. Create your first institution (for testing institution_admin)
The signup flow creates a `teacher` or `institution_admin` user but
doesn't yet auto-create an institution (that's part of a later
"invite flow" milestone). To test the institution dashboard now, run
this once in the Supabase SQL editor after signing up as an admin:
```sql
insert into institutions (name) values ('مدرسة تجريبية') returning id;
-- copy the returned id, then:
update users set institution_id = '<paste-id-here>' where email = 'your-admin-email@example.com';
```

### 5. Deploy
Push to GitHub, import into Vercel, add the same env vars there. Vercel
has real internet access, so `next/font/google` (recommended: swap in
Cairo for proper Arabic glyph support — see the comment in
`src/app/layout.tsx`) will work there even though it's disabled in this
sandbox.

## Milestone 2 — Session Setup (added on top of Milestone 1)

- **`/session/setup`**: real topic search (queried from `lesson_topics`),
  duration slider (10–30 min, enforced server-side too), a real PDF
  upload that extracts actual text via `pdf-parse` v2
  (`src/app/api/pdf-extract/route.ts`), a typed-summary alternative, and
  a live persona preview pulled from `student_personas`.
- **`POST /api/sessions/create`**: creates a real `sessions` row +
  `session_students` rows tied to the authenticated teacher's
  `auth.uid()` — an `institution_admin` account gets a 403 here even if
  they somehow reach the page, per spec §2.1 ("ممنوع يقدر يعمل جلسة
  محاكاة بنفسه من نفس حساب Admin").
- **`src/lib/ai/groq.ts`** + **`src/lib/ai/personas.ts`**: the real Groq
  client and the Egyptian-Arabic system-prompt builder for student
  agents, ready for Milestone 3 (Live Simulation) to actually call.
- **`/session/live/[id]`**: currently an honest placeholder — it proves
  the session row was really created (shows the real `session_id` and
  the real linked students from the DB) but does not fake a simulation
  UI. The mic capture, Whisper STT, per-turn student-agent responses,
  and Edge-TTS playback are Milestone 3.

### Try it
1. Log in as a `teacher`.
2. Go to `/session/setup` (or click "ابدأ جلسة جديدة +" on the dashboard).
3. Pick a topic, set duration, either upload a real PDF or type a
   summary, then "بدء محاكاة الفصل".
4. You'll land on `/session/live/<real-uuid>` and can confirm in
   Supabase's Table Editor that a real row now exists in `sessions` and
   four rows in `session_students`.

## Milestone 3 — Live Simulation Room (added on top of Milestones 1–2)

The core of the whole product, per spec Stage 6. Everything here is a
real network call to a real free-tier service — nothing scripted.

- **`/session/live/[id]`** is now the real room, not a placeholder:
  - **Mic capture**: `MediaRecorder` records the teacher's actual voice
    in the browser.
  - **`POST /api/stt`**: sends the real audio to **Groq Whisper
    large-v3** (`language: "ar"`) and returns the real transcription —
    no canned transcript.
  - **`POST /api/sessions/[id]/turn`**: two real Groq/Llama 3.3 70B
    calls per turn —
    1. `classifyTeacherUtterance` labels the utterance open/closed/
       statement (this is the literal mechanism behind "الأسئلة
       السقراطية" — an LLM judgment call, not a keyword match).
    2. `generateStudentReactions` asks the model, in one structured
       JSON call, what each of the four personas (with their real
       personality prompts from `student_personas`) does in response —
       whether they speak, what they say (Egyptian Arabic only,
       enforced in the prompt), their new state
       (attentive/hand_raised/distracted), and how their attention
       moves. Every response and state change is written to
       `session_events` and `session_students` for real — this is the
       full transcript the report (Milestone 5) will read from.
  - **`POST /api/tts`**: real Microsoft Edge neural voices
    (`ar-EG-SalmaNeural` / `ar-EG-ShakirNeural`, free, no API key) speak
    each responding student's actual generated line aloud.
  - **The HUD** (teacher talk ratio, Socratic question rate,
    inclusivity index) is computed client-side from the running event
    log after every turn — the exact same math as
    `src/lib/metrics/compute.ts`, which is also what finalizes the
    numbers server-side at session end.
- **`POST /api/sessions/[id]/end`**: marks the session `completed` and
  writes the final real metrics to the `sessions` row by running the
  shared metrics functions over the complete transcript. Also checks
  the first real badge condition (spec Stage 3): "Socrates Incarnate"
  unlocks automatically if `socratic_question_rate > 80` for that
  session — a code-evaluated condition, not a manually-toggled flag.
- **`/report/[id]`**: shows the four real computed numbers from the
  `sessions` row. The AI-generated narrative (performance summary,
  "session signal", evidence-moments timeline, personalized
  recommendations) is explicitly marked as pending — Milestone 5 — so
  nothing fake fills that space in the meantime.

### Try it
1. From a teacher dashboard, start a session (Milestone 2 flow).
2. In `/session/live/<id>`, click the mic, say something in Egyptian
   Arabic ("طيب يا جماعة، مين يقولّي إيه رأيكوا في الموضوع ده؟" is a good
   test of an open question), click again to stop.
3. Watch the event log fill with the real transcript, the four
   avatars' attention/state actually move, and you'll hear the
   responding student(s) speak in a real Egyptian voice.
4. Click "End Simulation" — you'll land on `/report/<id>` with real
   computed numbers, and can verify in Supabase that `sessions`,
   `session_events`, and `session_students` all have real rows.

### Known trade-offs worth knowing about
- **Response latency**: each turn makes 3 real network round-trips
  (STT → classify → generate reactions, then per-student TTS) — expect
  a few seconds per turn on Groq's free tier, not instant. This is
  inherent to using real inference, not a bug to "fix" by faking speed.
- **JSON parsing**: `generateStudentReactions` asks Llama for strict
  JSON via `response_format: { type: "json_object" }`. If the model
  ever returns malformed JSON, the code falls back to "no one responds
  this turn" rather than crashing — logged to the server console for
  visibility. Worth monitoring once you're testing with real usage.
- **Voice gender mapping** in `/api/tts` is currently a hardcoded name
  check (`سارة`/`نور` → female voice). Fine for the current 4 fixed
  personas; if custom personas are added later this should move to a
  `voice_gender` column on `student_personas` instead.

## Fixed since first testing round

You hit a real bug during testing: `POST /api/sessions/[id]/turn` was
returning an empty response body, causing `"Unexpected end of JSON
input"` in the browser. Root cause and fix:

1. **Groq deprecated `llama-3.3-70b-versatile`** (announced June 17,
   2026). Calling a decommissioned model throws inside the Groq SDK,
   and none of the AI routes had a top-level `try/catch`, so the
   exception crashed the route with no response body at all — not even
   an error JSON, just a dead connection, which is exactly what
   produces "Unexpected end of JSON input" client-side.
   **Fix**: `src/lib/ai/groq.ts` now uses `openai/gpt-oss-120b`, Groq's
   official recommended replacement (see comment in that file for the
   `qwen/qwen3.6-27b` alternative if Egyptian-dialect quality needs
   comparing).
2. **Every route that can throw** (`turn`, `end`, `sessions/create`)
   is now wrapped in a top-level `try/catch` that always returns a real
   `NextResponse.json({ error: ... })` — so a future model deprecation,
   a Groq rate limit, or any other real-world API hiccup shows the
   person an actual Arabic error message instead of silently dying.
3. **`LiveRoom.tsx`** now parses fetch responses defensively
   (`safeJson()`) instead of calling `.json()` directly, so even a
   truly empty body (e.g. a network drop) surfaces as a normal error
   message rather than an uncaught exception that breaks the recording
   flow.

Worth knowing: Groq deprecates models with some regularity. If you hit
a similar error again later, check
`console.groq.com/docs/deprecations` first — it's the most common
cause of a hard crash like this in this codebase.

## Fixed: password reset 404

You hit another real bug: the "forgot password" email link 404'd.
Root cause was two missing pieces, both fixed now:

1. **`/auth/confirm` and `/reset-password` routes didn't exist at all**
   — `requestPasswordResetAction` pointed `redirectTo` at
   `/reset-password`, but that page was never built, and even the
   verification step (`/auth/confirm`) that establishes a real session
   from the email link was missing. Both are now real routes:
   `src/app/auth/confirm/route.ts` verifies the recovery token and
   sets a genuine session cookie; `src/app/reset-password/page.tsx` is
   the real form that calls `supabase.auth.updateUser({ password })`.
2. **The middleware would have blocked it anyway** — `/auth/confirm`
   wasn't in `PUBLIC_PREFIXES` in `src/proxy.ts`, so an unauthenticated
   visitor clicking the email link would've been bounced to `/login`
   before the token was ever verified. Fixed by adding `/auth` to the
   public prefixes.

### ⚠️ One manual step required in the Supabase Dashboard

Supabase's *default* "Reset Password" email template links to
Supabase's own hosted verify endpoint and returns tokens in a URL hash
fragment — a flow that doesn't work with this app's cookie-based
server-side session handling (`@supabase/ssr`). You need to edit the
template once:

1. Supabase Dashboard → **Authentication → Email Templates → Reset Password**.
2. Replace the link in the template with:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
   ```
3. Supabase Dashboard → **Authentication → URL Configuration → Redirect URLs** — add your app's URL (e.g. `http://localhost:3000/**` for local dev, and your real domain for production), or `resetPasswordForEmail`'s `redirectTo` will be silently rejected.

Without this template change, the email will still send, but clicking
it will hit Supabase's own page instead of this app.

## Milestone 6 — Settings, Profile, and real dark mode

First item from the requirements-traceability report's priority list
(FR-04 Profile, FR-06 Dashboard completeness, NFR-12 partial).

- **`/settings`** is a real new page — previously there was no way to
  reach account management from the UI at all, and no logout button
  anywhere despite `signOutAction` already existing and working. Four
  real sections:
  - **Profile**: name + (for teachers) years of experience, teaching
    level, and subject — new columns added to `users` via a migration
    in `schema.sql` (`teaching_experience`, `teaching_level`,
    `subject`, `training_goals`).
  - **Email change**: real `supabase.auth.updateUser({ email })` —
    triggers Supabase's own confirmation-email flow.
  - **Password change**: real `updateUser({ password })`.
  - **Preferences**: theme (light/dark) and language, written to the
    `preferred_theme`/`preferred_language` columns that already existed
    in the schema but were never actually used anywhere until now.
- **Real dark mode** — not just a stored value nobody reads. Tailwind
  v4's `dark:` variant was switched from OS-only
  (`prefers-color-scheme`) to class-based
  (`@custom-variant dark (&:where(.dark, .dark *))` in `globals.css`),
  controlled by a `theme` cookie the root layout (`layout.tsx`, now a
  Server Component reading `cookies()`) applies server-side — so there's
  no flash of the wrong theme on load. Toggling it in Settings calls
  `router.refresh()` so it applies immediately. Real dark-mode styling
  was added to: the shared `AppHeader`, both dashboards, and Settings
  itself. Logging in on a new device also now applies the account's
  saved theme immediately (`signInAction` sets the cookie too), not
  just the browser's local state.
- **`AppHeader`** (`src/components/AppHeader.tsx`) — shared nav now on
  both dashboards and Settings, with real "الإعدادات" and "تسجيل
  الخروج" links. This closes a real gap: there was previously no way to
  navigate to Settings or log out from anywhere in the built UI.

### ⚠️ Honest scope note on the language preference
`preferred_language` **is saved for real** and read back correctly —
but selecting "English" does not currently change any rendered text.
Full localization (translating every page, adding an i18n framework,
handling LTR layout for the substantial amount of Arabic-specific
styling already in place) is a much larger, separate effort — item #7
in the requirements report's priority list, not started. The Settings
UI says this explicitly next to the language toggle rather than
pretending it works.

### ⚠️ Dark mode coverage
Real dark styling was added to the shared header, both dashboards, and
Settings — the pages someone lands on right after changing the
preference. It was **not** retrofitted onto Session Setup, the Report
page, or the landing/login pages in this pass (Live Simulation is
intentionally always-navy by original design, independent of this
toggle). Extending dark-mode coverage to the remaining pages is
mechanical (add `dark:` variants following the same pattern already
used) but wasn't done here to keep this increment scoped.

### ⚠️ Migration required
Re-run the updated `supabase/schema.sql` — it now includes
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements for the new
profile columns, safe to run against your existing database.

## Logo — now using the real uploaded files

`src/components/Logo.tsx` no longer renders the placeholder — it uses
your real `logo-dark-text.png` / `logo-light-text.png` uploads, saved
to `public/logo/logo-dark.png` and `public/logo/logo-light.png`. Both
were cropped to their actual content bounding box with a small
consistent padding, since the two source exports had different canvas
sizes (2048×1152 vs 1881×836) with different amounts of surrounding
whitespace — without that normalization the two variants would've
rendered at visibly different sizes for the same `height` prop despite
being the same logo. `<Logo variant="dark" />` is used on light
backgrounds (landing header, reset-password card) and
`<Logo variant="light" />` on dark ones (the login page's navy hero
panel), exactly per spec §6.1's conditional-by-background rule.

## Milestone 5 — AI-Generated Report (added on top of Milestones 1–4)

The last major gap from your spec: `/report/[id]` now has a genuinely
AI-written narrative, not just the four numeric metrics.

- **`src/lib/ai/report.ts`**: one real Groq call that reads the
  session's **actual transcript** (every `session_events` row, with
  real `event_id`s and timestamps) plus the real computed metrics, and
  writes:
  - `summary_ar` — a 2–4 sentence performance summary grounded in what
    actually happened in *this* session.
  - `session_signal_ar` — a one-line "signal" (spec's "إشارة الجلسة").
  - `recommendations` — 3–5 concrete next-session suggestions tied to
    this session's real weak points, not generic teaching advice.
  - `evidence_moments` — 3–5 real moments the model picked from the
    transcript, each referencing a genuine `event_id`. Any event_id the
    model might hallucinate gets filtered out against the real event
    list before saving — a broken "jump to moment" link can't happen.
- **Generated once**, inside `POST /api/sessions/[id]/end`, right when
  the session actually finishes — not regenerated on every page view
  (which would burn Groq quota and make the report non-deterministic
  between visits).
- **`POST /api/sessions/[id]/report/regenerate`**: a safety net. If
  generation happened to fail at end-of-session (a transient Groq
  error), the report page shows a real "not generated yet" state with
  a genuine retry button — never placeholder prose filling the gap.
- **`/report/[id]`** now also renders the **full real transcript**, and
  each evidence-moment card scrolls to and highlights its real matching
  line (`src/app/report/[id]/EvidenceAndTranscript.tsx`).

### Honest scope note: this is text-based "playback," not audio
Spec Stage 7 describes clicking ↗ to play back the actual audio of a
moment. No audio was persisted anywhere during the live session — the
mic recording and the synthesized TTS both only ever existed
transiently in the browser tab, never uploaded anywhere. So real audio
scrubbing isn't implemented here; building a fake audio player that
doesn't actually play anything would be exactly the kind of mock UI
this whole project is about removing. What's built instead is honest:
clicking an evidence moment jumps to and highlights the real
transcript line. If you want literal audio playback, that's a real
follow-up feature — it needs each turn's teacher audio (and ideally
each TTS response) uploaded to Supabase Storage during the live
session, which changes `/api/stt` and `/api/tts` to also persist the
audio blob and store its URL on the `session_events` row.

### Still not built from the original spec
PDF export, the public share-link feature, and the "EN" language
toggle on this page are the remaining items from Stage 7 — not started
yet.

### Try it
1. Run through Setup → Live Simulation → End Simulation as before.
2. Land on `/report/<id>` — you should now see a real written summary,
   a session signal line, 3–5 recommendations, and an "أدلة من الجلسة"
   section above the full transcript. Click one of those cards and
   confirm it scrolls to and highlights the exact right line below.
3. Check Supabase's `reports` table — a real row should exist for that
   `session_id` with real generated text, not placeholders.

## Fixed: three real bugs from live testing

You reported (with a screenshot): PDF upload always errors, nobody
responds in the live room and the HUD stays at 0%, and the topic
search is stuck to only the 4 seeded topics. All three were real bugs,
diagnosed and fixed — not worked around:

### 1. PDF upload always failed
**Root cause**: `pdf-parse` v2 depends on `pdfjs-dist` and a native
binary (`@napi-rs/canvas`). Left to Next's default bundling, importing
`pdf-parse` inside a route handler crashes at module-load time (errors
like `DOMMatrix is not defined` / `Cannot load @napi-rs/canvas`) —
*before* the route's own try/catch can even run, so every PDF failed
regardless of its content. Confirmed this by running `pdf-parse`
directly in plain Node (worked perfectly) versus inside the compiled
Next.js bundle (crashed) — isolating the bug to Next's bundling, not
the library or your PDFs.
**Fix**: `next.config.ts` now sets
`serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"]`,
which tells Next to `require()` these normally at runtime instead of
bundling them. Verified in the compiled output that `pdf-parse` is now
referenced via Turbopack's external-require mechanism instead of being
inlined.

### 2. Nobody responds / HUD stuck at 0%
**Root cause**: two compounding issues in the Groq calls inside
`src/lib/ai/turn.ts`:
- `openai/gpt-oss-120b` is a *reasoning* model — it spends part of its
  token budget on internal reasoning before writing the final answer.
  The classifier call's `max_tokens: 5` was so small the response
  could get cut off before any real answer was ever written.
- Neither Groq call was individually fault-isolated, so if the second
  call (student reactions) hit a transient error, the *entire* turn
  failed — explaining why the event log showed the teacher's own
  speech (logged before the failing call) but no student replies and
  no HUD movement.
**Fix**:
- Switched to `max_completion_tokens` (the current, non-deprecated
  param) with real headroom (2000 for the reactions call), and added
  `reasoning_effort: "low"` — supported by gpt-oss models specifically
  — to keep the reasoning-token overhead small, which also cuts
  latency.
- `temperature: 1` on the reactions call, per Groq's own community
  guidance that gpt-oss models degrade noticeably away from that value.
- **Fault isolation**: `classifyTeacherUtterance` and
  `generateStudentReactions` are now called independently in
  `src/app/api/sessions/[id]/turn/route.ts` — if one throws, the turn
  still completes with a safe fallback (defaults to "statement" /
  "no one responds this turn") instead of failing entirely. The
  server console now also logs the *specific* failure so a repeat
  issue is diagnosable instead of a generic message.
- In development, the turn route's error response now includes a
  `debug` field with the real exception message, and `LiveRoom.tsx`
  displays it inline — so if this happens again you'll see the actual
  Groq error text on screen, not just "حصل خطأ".

### 3. Topic search stuck to only 4 topics
This wasn't a bug exactly — Milestone 2 only seeded 4 example topics
and never gave a way to add more. A real, free, web-search-engine
integration would need a paid search API (contradicting your
free-tier-only constraint) and doesn't really fit a lesson-topic
picker anyway. The fix matching your own spec's intent (§5: the topic
list "لازم تقدر تتوسع ديناميكيًا") is simpler: when a search finds
nothing, a real **"➕ أضف '...' كموضوع جديد"** button now appears,
writing a real row to `lesson_topics` via
`POST /api/lesson-topics/create` and selecting it immediately. Scoped
by a real RLS policy (`topics_write` in `schema.sql`) so a teacher can
only add topics into their own institution's list (or the global list
if unaffiliated) — same isolation guarantee as everything else.

**⚠️ You need to re-run the updated `supabase/schema.sql`** in the
Supabase SQL editor to pick up the new `topics_write` policy — it's
safe to re-run the whole file (every statement is drop-then-create or
`insert ... where not exists`).

## Milestone 7 — Strengths/Weaknesses, Simulation History, Growth Portfolio

Continuing down the requirements-report priority list (items #2 and #3).

- **Structured strengths/weaknesses** (spec FR-28/FR-31/DA-10/DA-11):
  `reports` now has real `strengths` and `weaknesses` columns, filled by
  the same LLM call that already reads the transcript
  (`src/lib/ai/report.ts`) — 2-3 specific, transcript-grounded points
  each, explicitly instructed to stay empty rather than invent generic
  filler when a session is too short to have clear signal. Rendered as
  two distinct cards on `/report/[id]`, above the recommendations.
- **`/history`** (spec FR-41): a real dedicated Simulation History page
  with real pagination (Postgres `range()`, 10 per page) — previously
  the only view was a hardcoded last-5 table on the dashboard.
- **`/growth`** (spec FR-42/43/45): a real Growth Portfolio —
  - A hand-rolled SVG trend chart (no new chart library needed for one
    line) plotting any of the 4 real metrics across up to the last 30
    completed sessions, with a metric switcher and a real
    improving/declining/stable trend label (first session's value vs.
    the latest).
  - Per-skill averages shown separately (talk ratio, Socratic rate,
    inclusivity, overall) rather than only one aggregate number — this
    is what FR-45 ("track individual pedagogical skills separately")
    actually asks for.
  - A real badges list reading from the `badges` table (currently just
    the one "Socrates Incarnate" condition built in Milestone 3, but
    the list renders whatever's actually unlocked).
- Both new pages are correctly scoped `teacher`-only in
  `src/proxy.ts`'s middleware, same as `/session/*`.
- Dashboard header now links to both new pages.

### ⚠️ Migration required
Re-run `supabase/schema.sql` again — it adds `strengths`/`weaknesses`
columns to `reports` via `ADD COLUMN IF NOT EXISTS`, safe against
existing data. Reports generated *before* this migration will show
empty strength/weakness sections until regenerated (use the "ولّد
التحليل دلوقتي" button on that session's report page) — the numeric
metrics are unaffected either way.

## Test cases still to write (spec §2.1 rule 6)

Before moving to step 2, worth adding:
- Teacher A cannot fetch Teacher B's report by guessing/editing a `/report/:id` URL.
- Admin of Institution X gets zero rows querying Institution Y's sessions.
- A `teacher` role hitting `/dashboard/institution` gets redirected, not a 500.

These are straightforward to add with Playwright or Vitest once step 2
gives us actual session data to test against.
