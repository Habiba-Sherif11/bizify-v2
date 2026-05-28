export interface SkillsGap {
  your_skills:     string[];
  required_skills: string[];
  skill_gaps:      string[];
}

export interface TopValidatedProblem {
  id:    string;
  title: string;
  score: number;
}

export interface FeasibilityBreakdown {
  why_this_score:   string;
  limiting_factors: string[];
  to_reach_10:      string[];
}

export interface ProblemEvidence {
  problems_analyzed:    number;
  top_validated:        TopValidatedProblem[];
  why_this_idea:        string;
  primary_gap:          string;
  customer_signal:      string;
  feasibility_breakdown?: FeasibilityBreakdown;
}

export interface Idea {
  id: string;
  owner_id: string;
  business_id: string | null;
  title: string | null;
  description: string | null;
  status: "draft" | "active" | "archived";
  ai_score: number | null;
  budget: number | null;
  skills: SkillsGap | Record<string, unknown>[] | null;
  feasibility: number | null;
  is_score_outdated: boolean;
  is_archived: boolean;
  archived_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
  // AI seed fields
  domain:              string | null;
  problem_evidence:    ProblemEvidence | null;
  core_insight:        string | null;
  target_segment:      string | null;
  founding_hypothesis: string | null;
}

export interface CreateIdeaPayload {
  title: string;
  description: string;
}

export interface IdeaFilters {
  min_budget?: number;
  max_budget?: number;
  skills?: string;
  feasibility?: number;
  domain?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
