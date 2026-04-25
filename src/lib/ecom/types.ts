// ── ECOM Roadmap V2 — Types ──────────────────────────────────────

export type StageStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "pending_validation"
  | "validated"
  | "completed";

export type TaskPriority = "normal" | "important" | "blocking" | "validation";

export type InsightType = "warning" | "tip" | "trap" | "signal";

export type ModuleImportance = "fondation" | "recommandé" | "avancé";

export type TaskImpact = "fort" | "moyen" | "faible";

// ── Core models ──

export interface EcomModule {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  importance: ModuleImportance;
  benefit: string;
  xp: number;
}

export interface EcomTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  xp: number;
  impact: TaskImpact;
  unlocks?: string;
  recommended?: boolean;
}

export interface EcomValidation {
  id: string;
  title: string;
  description: string;
  validated: boolean;
  blocksNext: boolean;
  requirement: string;
  unlocksLabel: string;
  missingAction?: string;
}

export interface EcomInsight {
  type: InsightType;
  title: string;
  content: string;
}

export interface EcomScoreCard {
  label: string;
  value: number;
  max: number;
}

export interface EcomChecklist {
  label: string;
  items: { text: string; checked: boolean }[];
}

export interface EcomUnlockInfo {
  unlocks: string;
  condition: string;
  riskIfIgnored: string;
}

export interface EcomStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  objective: string;
  iconName: string;
  status: StageStatus;
  estimatedDuration: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  modules: EcomModule[];
  tasks: EcomTask[];
  validation: EcomValidation | null;
  insights: EcomInsight[];
  notes: string;
  score: EcomScoreCard | null;
  checklists: EcomChecklist[];
  unlock: EcomUnlockInfo;
}

// ── Gamification ──

export interface EcomBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  tier: "bronze" | "argent" | "or" | "platine";
}

export interface EcomLevel {
  number: number;
  name: string;
  minXp: number;
}

export const ECOM_LEVELS: EcomLevel[] = [
  { number: 1, name: "Explorateur", minXp: 0 },
  { number: 2, name: "Apprenti", minXp: 150 },
  { number: 3, name: "Lanceur", minXp: 400 },
  { number: 4, name: "Stratège", minXp: 800 },
  { number: 5, name: "Scaler", minXp: 1400 },
  { number: 6, name: "Expert", minXp: 2200 },
];

// ── Business Health ──

export interface EcomHealthScore {
  id: string;
  label: string;
  value: number;
  max: number;
  status: "critique" | "fragile" | "correct" | "solide";
  explanation: string;
  nextMove: string;
}

// ── Progress state ──

export interface EcomProgress {
  level: EcomLevel;
  xp: number;
  xpToNext: number;
  xpInLevel: number;
  xpLevelRange: number;
  streak: number;
  completedTasks: number;
  totalTasks: number;
  completedModules: number;
  totalModules: number;
  completedStages: number;
  totalStages: number;
  percentage: number;
  estimatedTimeLeft: string;
  estimatedDaysLeft: number;
  currentStageId: string;
  nextAction: { stageTitle: string; task: string; reason: string; xp: number; unlocks?: string } | null;
  actionsToNextStage: number;
  nextStageName: string;
  businessHealth: EcomHealthScore[];
  globalReadiness: number;
}
