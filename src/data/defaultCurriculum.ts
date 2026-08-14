import type { FirestoreQuestion } from "../types";
import { MASTER_MODULES, DEFAULT_SUBJECT_MODULE_IDS } from "./subjects";

export interface DefaultModuleDef {
  id: string;
  subjectId: string;
  name: string;
  order: number;
}

export function buildDefaultModules(): Record<string, DefaultModuleDef[]> {
  const result: Record<string, DefaultModuleDef[]> = {};
  const masterMap = new Map(MASTER_MODULES.map((m) => [m.id, m]));

  for (const [subjectId, moduleIds] of Object.entries(DEFAULT_SUBJECT_MODULE_IDS)) {
    result[subjectId] = moduleIds
      .map((id, index) => {
        const master = masterMap.get(id);
        if (!master) return null;
        return {
          id: `${subjectId}-${master.id}`,
          subjectId,
          name: master.name,
          order: index,
        };
      })
      .filter((m): m is DefaultModuleDef => m !== null);
  }

  return result;
}

export const DEFAULT_MODULES: Record<string, DefaultModuleDef[]> = buildDefaultModules();

export const DEFAULT_QUESTIONS: FirestoreQuestion[] = [];
