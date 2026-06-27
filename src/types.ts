export interface DreamAnalysis {
  dream_title: string;
  summary: string;
  places: string[];
  characters: string[];
  emotions: string[];
  motifs: string[];
  colors: string[];
  metaphor: string;
  reflection_question: string;
  inner_weather: {
    type: string;
    description: string;
  };
  self_care: {
    action: string;
    reason: string;
  };
  garden_update: {
    new_place: string;
    description: string;
  };
  risk_level: 'low' | 'high';
  illustration_style?: string;
  illustration_prompt?: string;
  illustration_url?: string;
}

export interface DreamEntry {
  dream_id: string;
  created_at: string;
  raw_input: string;
  input_type: 'text' | 'voice';
  analysis_mode?: 'default' | 'freud' | 'jung';
  analysis: DreamAnalysis;
}

export interface GardenObject {
  object_id: string;
  source_dream_id: string;
  type: 'place' | 'motif' | 'plant' | 'structure';
  name: string;
  related_motifs: string[];
  related_emotions: string[];
  description: string;
  appearance_count: number;
  last_updated: string;
}

export interface WeeklySummary {
  week_start: string;
  dream_count: number;
  top_emotions: { name: string; count: number }[];
  top_motifs: { name: string; count: number }[];
  weather_history: { date: string; weather: string }[];
  weekly_metaphor: string;
  weekly_self_care: string;
  garden_updates: string[];
}
