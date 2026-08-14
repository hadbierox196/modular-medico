import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Difficulty, FirestoreQuestion, ModuleDoc, QuestionStatus } from "../types";

/* ---------------------------- Modules ---------------------------- */

export function subscribeModules(subjectId: string, cb: (modules: ModuleDoc[]) => void) {
  const q = query(collection(db, "modules"), where("subjectId", "==", subjectId), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ModuleDoc, "id">) })));
  });
}

export async function createModule(subjectId: string, name: string, order: number) {
  const ref = await addDoc(collection(db, "modules"), { subjectId, name, order });
  return ref.id;
}

/* --------------------------- Questions ---------------------------- */

export interface QuestionInput {
  subjectId: string;
  moduleId: string;
  moduleName: string;
  block: number;
  difficulty: Difficulty;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  status?: QuestionStatus;
}

export async function addQuestion(input: QuestionInput) {
  await addDoc(collection(db, "questions"), {
    ...input,
    status: input.status ?? "draft",
    createdAt: Date.now(),
  });
}

export async function bulkAddQuestions(inputs: QuestionInput[]) {
  const batch = writeBatch(db);
  inputs.forEach((input) => {
    const ref = doc(collection(db, "questions"));
    batch.set(ref, { ...input, status: input.status ?? "draft", createdAt: Date.now() });
  });
  await batch.commit();
}

export async function updateQuestionStatus(id: string, status: QuestionStatus) {
  await updateDoc(doc(db, "questions", id), { status });
}

export async function deleteQuestion(id: string) {
  await deleteDoc(doc(db, "questions", id));
}

/** Live view of every question for a subject (admin question-bank tab, filters applied client-side). */
export function subscribeSubjectQuestions(subjectId: string, cb: (questions: FirestoreQuestion[]) => void) {
  const q = query(collection(db, "questions"), where("subjectId", "==", subjectId));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreQuestion, "id">) })));
  });
}

/** Live view of every question in the bank (admin dashboard counts). */
export function subscribeAllQuestions(cb: (questions: FirestoreQuestion[]) => void) {
  return onSnapshot(collection(db, "questions"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreQuestion, "id">) })));
  });
}

/** One-time fetch of published questions for a practice session. */
export async function fetchPublishedBlock(
  subjectId: string,
  moduleId: string,
  block: number,
  difficulty?: Difficulty
): Promise<FirestoreQuestion[]> {
  const clauses = [
    where("subjectId", "==", subjectId),
    where("moduleId", "==", moduleId),
    where("block", "==", block),
    where("status", "==", "published"),
  ];
  if (difficulty) clauses.push(where("difficulty", "==", difficulty));
  const q = query(collection(db, "questions"), ...clauses);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreQuestion, "id">) }));
}

/** Live per-block published-question counts for a module, used to render the Block 1–15 grid. */
export function subscribeModuleBlockCounts(subjectId: string, moduleId: string, cb: (counts: Record<number, number>) => void) {
  const q = query(
    collection(db, "questions"),
    where("subjectId", "==", subjectId),
    where("moduleId", "==", moduleId),
    where("status", "==", "published")
  );
  return onSnapshot(q, (snap) => {
    const counts: Record<number, number> = {};
    snap.docs.forEach((d) => {
      const block = (d.data() as FirestoreQuestion).block;
      counts[block] = (counts[block] || 0) + 1;
    });
    cb(counts);
  });
}
