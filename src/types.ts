export type Difficulty = "easy" | "medium" | "hard";

export interface MCQ {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuestionSet {
  id: string;
  title: string;
  free: boolean;
  difficulty: Difficulty;
  highYield: boolean;
  questions?: MCQ[];
  questionCount?: number;
}

export interface Module {
  id: string;
  name: string;
  sets: QuestionSet[];
}

export interface Subject {
  id: string;
  modules: Module[];
}

export interface SubjectMeta {
  label: string;
  tag: string;
}

export interface AnswerRecord {
  selected: number | null;
  correct: boolean;
}

export interface PracticeConfig {
  mode: "traditional" | "omr";
  timing: "untimed" | "timed";
  spacedRep: boolean;
}

export type AdminQuestionStatus = "draft" | "published";

export interface AdminQuestion {
  id: string;
  subject: string;
  module: string;
  q: string;
  options: string[];
  correct: number;
  status: AdminQuestionStatus;
}

export interface ImportResult {
  line: number;
  raw: string;
  status: "valid" | "warning" | "error";
  message: string;
  q?: string;
  options?: string[];
  correct?: number;
}
