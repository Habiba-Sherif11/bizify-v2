export interface Idea {
  id: string;
  owner_id: string;
  business_id: string | null;
  title: string | null;
  description: string | null;
  status: "draft" | "active" | "archived";
  ai_score: number | null;
  budget: number | null;
  skills: string[] | null;
  feasibility: number | null;
  is_score_outdated: boolean;
  is_archived: boolean;
  archived_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
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
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
