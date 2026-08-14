export type Difficulty = "easy" | "medium" | "hard";

export interface SubjectMeta {
  label: string;
  tag: string;
}

export interface Question {
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
  // A set has either a full list of questions, or just a count (for locked/preview sets)
  questions?: Question[];
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

export interface SubjectAccuracy {
  subject: string;
  accuracy: number;
}

export const SUBJECT_ACCURACY: SubjectAccuracy[] = [
  { subject: "Physiology", accuracy: 64 },
  { subject: "Pharm", accuracy: 52 },
  { subject: "Pathology", accuracy: 71 },
  { subject: "Biochem", accuracy: 45 },
  { subject: "Micro", accuracy: 60 },
];

export const SEED_ADMIN_BANK: AdminQuestion[] = [
  {
    id: "seed-1",
    subject: "anatomy",
    module: "Upper Limb",
    q: "The radial nerve is a continuation of which cord of the brachial plexus?",
    options: ["Lateral cord", "Medial cord", "Posterior cord", "Upper trunk"],
    correct: 2,
    status: "published",
  },
  {
    id: "seed-2",
    subject: "physiology",
    module: "Cardiovascular",
    q: "Which phase of the cardiac cycle corresponds to the QRS complex?",
    options: ["Isovolumetric relaxation", "Ventricular filling", "Isovolumetric contraction", "Atrial systole"],
    correct: 2,
    status: "draft",
  },
];
