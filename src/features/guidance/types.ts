export interface Stage {
  id: string;
  name: string;
  description: string;
  sequence_order: number;
  concepts: Concept[];
}

export interface Concept {
  id: string;
  title: string;
  concept_explanation: string;
  platform_support_explanation: string;
  sequence_order: number;
  is_available: boolean;
  stage_id: string;
}

export interface GuidanceProgress {
  last_viewed_concept_id: string | null;
  user_id: string;
  updated_at: string;
}

export interface TourStep {
  stageId: string;
  stageName: string;
  stageIndex: number;
  totalStages: number;
  concept: Concept;
  conceptIndex: number;
  totalConceptsInStage: number;
  absoluteIndex: number;
  totalSteps: number;
}
