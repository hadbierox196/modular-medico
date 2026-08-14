import type { SubjectMeta } from "../types";

export const TOTAL_BLOCKS = 15;

export const SUBJECT_LIST = ["anatomy", "biochemistry", "physiology", "pathology", "pharmacology"] as const;

export type SubjectId = (typeof SUBJECT_LIST)[number];

export const SUBJECT_META: Record<SubjectId, SubjectMeta> = {
  anatomy: { label: "Anatomy", tag: "Structure" },
  biochemistry: { label: "Biochemistry", tag: "Pathways" },
  physiology: { label: "Physiology", tag: "Function" },
  pathology: { label: "Pathology", tag: "Disease" },
  pharmacology: { label: "Pharmacology", tag: "Mechanisms" },
};

export const isSubjectId = (id: string): id is SubjectId => (SUBJECT_LIST as readonly string[]).includes(id);
