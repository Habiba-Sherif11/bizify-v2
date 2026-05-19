"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Loader2,
  RotateCcw,
  X,
  Pencil,
  CheckCircle2,
  Clock,
  Plus,
  Star,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/features/auth/lib/api";
import { parseBackendError } from "@/lib/backend-error";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionnaireStep } from "@/features/auth/components/QuestionnaireStep";
import { SkillsStep, type SkillEntry } from "@/features/auth/components/SkillsStep";
import { useAuth } from "@/features/auth/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

// Matches the UserProfile schema from the backend handoff
type ProfileResponse = {
  id?: string;
  user_id?: string;
  bio?: string | null;
  skills_json?: SkillRecord[] | null;
  questionnaire_json?: QuestionnaireData | null;
  guide_status?: "NOT_STARTED" | "COMPLETED" | "POSTPONED" | "SKIPPED" | string;
  onboarding_completed?: boolean;
  updated_at?: string | null;
};

// Matches the QuestionnaireData shape stored in profile.questionnaire_json
type QuestionnaireData = {
  user_profile?: {
    curiosity_domain?: string | null;
    experience_level?: string | null;
    business_interests?: string[] | null;
    target_region?: string | null;
    founder_setup?: string | null;
    risk_tolerance?: string | null;
  };
  career_profile?: {
    free_day_preferences?: string[] | null;
    preferred_work_types?: string[] | null;
    problem_solving_styles?: string[] | null;
    preferred_work_environments?: string[] | null;
    desired_impact?: string[] | null;
  };
};

// QuestionnaireEntry is the POST format — also what some older GET responses return
type QuestionnaireEntry = {
  field: string;
  question: string;
  multi: boolean;
  choices: string[];
  label?: string;
};

// Normalised display row for either response shape
type QuestionnaireRow = {
  label: string;
  value: string;
};

// Skill from the backend: { id, name, rating }
type SkillRecord = {
  id?: string;
  name?: string;
  skill_name?: string;
  rating?: number;
  [key: string]: unknown;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return data ? parseBackendError(data) : fallback;
}

// Convert QuestionnaireData object (backend GET shape) into displayable rows
function questionnaireDataToRows(data: QuestionnaireData): QuestionnaireRow[] {
  const rows: QuestionnaireRow[] = [];
  const up = data.user_profile;
  const cp = data.career_profile;

  const add = (label: string, value: string | string[] | null | undefined) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    rows.push({ label, value: Array.isArray(value) ? value.join(", ") : value });
  };

  if (up) {
    add("Curiosity domain", up.curiosity_domain);
    add("Experience level", up.experience_level);
    add("Business interests", up.business_interests);
    add("Target region", up.target_region);
    add("Founder setup", up.founder_setup);
    add("Risk tolerance", up.risk_tolerance);
  }
  if (cp) {
    add("Free day preferences", cp.free_day_preferences);
    add("Preferred work types", cp.preferred_work_types);
    add("Problem-solving styles", cp.problem_solving_styles);
    add("Work environments", cp.preferred_work_environments);
    add("Desired impact", cp.desired_impact);
  }
  return rows;
}

// Parse the GET /profile/questionnaire response into displayable rows.
// Backend can return either:
//   - A QuestionnaireData object (nested user_profile / career_profile)
//   - A QuestionnaireEntry[] array (legacy / some older versions)
function parseQuestionnaire(raw: unknown): QuestionnaireRow[] | null {
  if (!raw) return null;

  // QuestionnaireData object shape
  if (
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    ((raw as QuestionnaireData).user_profile || (raw as QuestionnaireData).career_profile)
  ) {
    const rows = questionnaireDataToRows(raw as QuestionnaireData);
    return rows.length > 0 ? rows : null;
  }

  // Legacy array of QuestionnaireEntry
  if (Array.isArray(raw)) {
    const entries = raw as QuestionnaireEntry[];
    const rows = entries
      .filter((e) => e.choices?.length > 0)
      .map((e) => ({
        label: e.label ?? e.field,
        value: e.choices.join(", "),
      }));
    return rows.length > 0 ? rows : null;
  }

  // JSON string fallback
  if (typeof raw === "string") {
    try { return parseQuestionnaire(JSON.parse(raw)); } catch { return null; }
  }

  return null;
}

function getSkillId(skill: SkillRecord): string | undefined {
  for (const c of [skill.id, skill.skill_id]) {
    if (typeof c === "string" || typeof c === "number") return String(c);
  }
  return undefined;
}

function getSkillLabel(skill: SkillRecord): string {
  for (const c of [skill.name, skill.skill_name]) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "Skill";
}

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5" title={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          className={cn(
            n <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-neutral-300 dark:text-neutral-600"
          )}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [questionnaireRows, setQuestionnaireRows] = useState<QuestionnaireRow[] | null>(null);
  const [skills, setSkills] = useState<SkillRecord[]>([]);

  const [showQuestionnaireForm, setShowQuestionnaireForm] = useState(false);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [questionnaireKey, setQuestionnaireKey] = useState(0);
  const [skillsKey, setSkillsKey] = useState(0);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const existingSkillNames = useMemo(
    () => new Set(skills.map((s) => getSkillLabel(s).toLowerCase())),
    [skills]
  );

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get<ProfileResponse>("/profile");
      setProfile(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load profile"));
    }
  }, []);

  const loadQuestionnaire = useCallback(async () => {
    setLoadingQuestionnaire(true);
    try {
      const { data } = await api.get("/profile/questionnaire");
      setQuestionnaireRows(parseQuestionnaire(data));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load questionnaire"));
    } finally {
      setLoadingQuestionnaire(false);
    }
  }, []);

  const loadSkills = useCallback(async () => {
    setLoadingSkills(true);
    try {
      const { data } = await api.get<SkillRecord[]>("/profile/skills");
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load skills"));
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      setLoading(true);
      await Promise.allSettled([loadProfile(), loadQuestionnaire(), loadSkills()]);
      if (active) setLoading(false);
    };
    loadAll();
    return () => { active = false; };
  }, [loadProfile, loadQuestionnaire, loadSkills]);

  const handleQuestionnaireSubmit = async (payload: { field: string; question: string; multi: boolean; choices: string[]; label: string }[]) => {
    const cleanPayload = payload.filter((p) => p.choices.length > 0);
    if (cleanPayload.length === 0) {
      toast.error("Please answer at least one question before saving.");
      return;
    }
    try {
      await api.post("/profile/questionnaire", cleanPayload);
      toast.success("Answers saved");
      setShowQuestionnaireForm(false);
      await Promise.all([loadQuestionnaire(), loadProfile()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save answers"));
    }
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await api.post("/profile/restart");
      setQuestionnaireRows(null);
      setQuestionnaireKey((k) => k + 1);
      setShowQuestionnaireForm(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reset questionnaire"));
    } finally {
      setRestarting(false);
    }
  };

  const handleAddSkills = async (entries: SkillEntry[]) => {
    try {
      for (const entry of entries) {
        await api.post("/profile/skills", entry);
      }
      await api.post("/profile/complete");
      toast.success("Skills saved");
      setShowSkillsForm(false);
      setSkillsKey((k) => k + 1);
      await Promise.all([loadSkills(), loadProfile()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save skills"));
    }
  };

  const handleRemoveSkill = async (skill: SkillRecord) => {
    const skillId = getSkillId(skill);
    if (!skillId) return;
    try {
      await api.delete(`/profile/skills/${encodeURIComponent(skillId)}`);
      setSkills((prev) => prev.filter((s) => getSkillId(s) !== skillId));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove skill"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const initials = (user?.name || user?.email || "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Profile</span>
        </nav>

        <div className="mt-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
            Your profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your information and skills.
          </p>
        </div>

        {/* Onboarding status banner */}
        {profile && !profile.onboarding_completed && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3.5">
            <Clock size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Profile incomplete
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Complete the questionnaire and add your skills to unlock AI features.
              </p>
            </div>
          </div>
        )}

        {profile?.onboarding_completed && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3.5">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Profile complete
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* ── Identity card ── */}
          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-semibold">{initials}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                  {user?.name || "—"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "—"}
                </p>
                {profile?.guide_status && profile.guide_status !== "NOT_STARTED" && (
                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-[10px] font-medium text-cyan-700 dark:text-cyan-300">
                    <User size={9} />
                    {profile.guide_status.replace(/_/g, " ").toLowerCase()}
                  </span>
                )}
              </div>

              <Link
                href="/entrepreneur/settings"
                className="shrink-0 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Edit
              </Link>
            </div>

            {profile?.bio && (
              <p className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </section>

          {/* ── Questionnaire ── */}
          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Your answers
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Personalises your AI recommendations.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {questionnaireRows?.length ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowQuestionnaireForm((p) => !p)}>
                      <Pencil size={13} />
                      {showQuestionnaireForm ? "Cancel" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRestart} disabled={restarting}>
                      <RotateCcw size={13} />
                      {restarting ? "Resetting…" : "Reset"}
                    </Button>
                  </>
                ) : !showQuestionnaireForm ? (
                  <Button variant="primary-gradient" size="sm" onClick={() => setShowQuestionnaireForm(true)}>
                    Start questionnaire
                  </Button>
                ) : null}
              </div>
            </div>

            {loadingQuestionnaire ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            ) : !showQuestionnaireForm && questionnaireRows?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {questionnaireRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-lg bg-gray-50 dark:bg-neutral-900/40 px-4 py-3"
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-800 dark:text-gray-100">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : !showQuestionnaireForm ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                You haven&apos;t answered the questionnaire yet.
              </p>
            ) : null}

            {showQuestionnaireForm && (
              <div className={cn(questionnaireRows?.length && "border-t border-gray-200 dark:border-neutral-700 pt-5 mt-2")}>
                <QuestionnaireStep
                  key={questionnaireKey}
                  onNext={handleQuestionnaireSubmit}
                />
              </div>
            )}
          </section>

          {/* ── Skills ── */}
          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Skills
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Skills on your profile — rated 1–5 by the AI.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {skills.length > 0 ? (
                  <Button variant="outline" size="sm" onClick={() => setShowSkillsForm((p) => !p)}>
                    <Plus size={13} />
                    {showSkillsForm ? "Cancel" : "Add"}
                  </Button>
                ) : !showSkillsForm ? (
                  <Button variant="primary-gradient" size="sm" onClick={() => setShowSkillsForm(true)}>
                    Add skills
                  </Button>
                ) : null}
              </div>
            </div>

            {loadingSkills ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            ) : !showSkillsForm && skills.length > 0 ? (
              <div className="space-y-2">
                {skills.map((skill) => {
                  const label = getSkillLabel(skill);
                  const id = getSkillId(skill);
                  return (
                    <div
                      key={`${label}-${id ?? "custom"}`}
                      className="rounded-lg bg-gray-50 dark:bg-neutral-900/40 px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-sm text-neutral-800 dark:text-gray-100 truncate">{label}</p>
                        <RatingStars rating={skill.rating} />
                      </div>
                      {id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${label}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !showSkillsForm ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                No skills added yet.
              </p>
            ) : null}

            {showSkillsForm && (
              <div className={cn(skills.length > 0 && "border-t border-gray-200 dark:border-neutral-700 pt-5 mt-2")}>
                <SkillsStep
                  key={skillsKey}
                  onComplete={handleAddSkills}
                  title="Add skills"
                  description="Search or browse by category — type anything to add a custom skill."
                  submitLabel="Save skills"
                  existingSkillNames={existingSkillNames}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
