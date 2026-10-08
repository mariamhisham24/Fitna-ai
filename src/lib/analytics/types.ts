/**
 * Fitna AI Analytics Types & Schemas
 * Standardized, non-invasive telemetry event definitions for PostHog.
 */

export type AnalyticsLanguage = "ar-EG" | "ar-SA" | "en";

export type FitnaAnalyticsEvent =
  // Authentication
  | "user_signed_up"
  | "user_logged_in"
  | "user_logged_out"
  // Navigation
  | "landing_page_viewed"
  | "login_page_viewed"
  | "dashboard_viewed"
  | "session_setup_viewed"
  | "growth_viewed"
  | "history_viewed"
  | "guide_viewed"
  | "settings_viewed"
  | "page_viewed"
  // Simulation Lifecycle
  | "scenario_selected"
  | "session_started"
  | "session_paused"
  | "session_resumed"
  | "session_completed"
  | "session_abandoned"
  // Debrief & Evaluation
  | "debrief_viewed"
  | "report_viewed"
  // Classroom Engagement
  | "student_interaction"
  | "teacher_message_sent"
  | "student_response_received";

export interface BaseEventProperties {
  language?: AnalyticsLanguage | string;
  interface_language?: "ar" | "en";
  market?: "eg" | "sa";
  locale?: string;
  [key: string]: unknown;
}

export interface UserSignedUpProperties extends BaseEventProperties {
  role?: "teacher" | "institution_admin";
  nationality?: "eg" | "sa";
  signup_method?: string;
}

export interface UserLoggedInProperties extends BaseEventProperties {
  role?: string;
  login_method?: string;
}

export interface ScenarioSelectedProperties extends BaseEventProperties {
  scenario_id?: string;
  scenario_name?: string;
}

export interface SessionStartedProperties extends BaseEventProperties {
  session_id: string;
  scenario_id?: string;
  scenario_name?: string;
  classroom_mode?: string;
  duration_minutes?: number;
  voice_language?: string;
}

export interface SessionCompletedProperties extends BaseEventProperties {
  session_id: string;
  scenario_id?: string;
  scenario_name?: string;
  duration_seconds: number;
  completion_status: "completed" | "auto_completed" | "time_expired";
  overall_score?: number | null;
  teacher_talk_ratio?: number | null;
  socratic_rate?: number | null;
  inclusivity_index?: number | null;
}

export interface SessionAbandonedProperties extends BaseEventProperties {
  session_id: string;
  duration_seconds?: number;
  reason?: string;
}

export interface DebriefViewedProperties extends BaseEventProperties {
  session_id: string;
  duration_seconds?: number;
  overall_score?: number | null;
  has_report?: boolean;
}

export interface EngagementEventProperties extends BaseEventProperties {
  session_id: string;
  student_name?: string;
  student_persona_id?: string;
  interaction_type?: "voice" | "text" | "turn" | "interruption";
  question_type?: "open" | "closed" | "statement";
}
