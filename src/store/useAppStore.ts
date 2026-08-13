import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_ADMIN_BANK } from "../data/mockData";
import type { AdminQuestion, PracticeConfig, MCQ, AnswerRecord } from "../types";

export interface ActiveSetRef {
  subjectId: string;
  moduleId: string;
  moduleName: string;
  setId: string;
  setTitle: string;
  difficulty: "easy" | "medium" | "hard";
  highYield: boolean;
  questions: MCQ[];
}

export interface QuizSession {
  setRef: ActiveSetRef;
  config: PracticeConfig;
  queue: number[];
  pos: number;
  record: Record<number, AnswerRecord>;
  bookmarked: Record<number, boolean>;
}

interface AppState {
  isDark: boolean;
  toggleDark: () => void;

  isLoggedIn: boolean;
  displayName: string;
  logIn: (name: string) => void;
  logOut: () => void;

  isAdmin: boolean;
  enterAdmin: () => void;
  exitAdmin: () => void;

  adminBank: AdminQuestion[];
  setAdminBank: (updater: (bank: AdminQuestion[]) => AdminQuestion[]) => void;

  bookmarks: { subjectId: string; setId: string; question: MCQ }[];
  addBookmark: (subjectId: string, setId: string, question: MCQ) => void;
  removeBookmark: (question: MCQ) => void;

  session: QuizSession | null;
  startSession: (setRef: ActiveSetRef, config: PracticeConfig) => void;
  updateSession: (patch: Partial<QuizSession>) => void;
  clearSession: () => void;

  lastResult: { setRef: ActiveSetRef; answers: AnswerRecord[] } | null;
  setLastResult: (setRef: ActiveSetRef, answers: AnswerRecord[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),

      isLoggedIn: false,
      displayName: "",
      logIn: (name) => set({ isLoggedIn: true, displayName: name || "Student" }),
      logOut: () => set({ isLoggedIn: false, displayName: "" }),

      isAdmin: false,
      enterAdmin: () => set({ isAdmin: true }),
      exitAdmin: () => set({ isAdmin: false }),

      adminBank: SEED_ADMIN_BANK,
      setAdminBank: (updater) => set((s) => ({ adminBank: updater(s.adminBank) })),

      bookmarks: [],
      addBookmark: (subjectId, setId, question) =>
        set((s) => (s.bookmarks.some((b) => b.question.q === question.q) ? s : { bookmarks: [...s.bookmarks, { subjectId, setId, question }] })),
      removeBookmark: (question) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.question.q !== question.q) })),

      session: null,
      startSession: (setRef, config) =>
        set({
          session: {
            setRef,
            config,
            queue: setRef.questions.map((_, i) => i),
            pos: 0,
            record: {},
            bookmarked: {},
          },
        }),
      updateSession: (patch) => {
        const current = get().session;
        if (!current) return;
        set({ session: { ...current, ...patch } });
      },
      clearSession: () => set({ session: null }),

      lastResult: null,
      setLastResult: (setRef, answers) => set({ lastResult: { setRef, answers } }),
    }),
    {
      name: "modular-medico-store",
      partialize: (s) => ({
        isDark: s.isDark,
        isLoggedIn: s.isLoggedIn,
        displayName: s.displayName,
        adminBank: s.adminBank,
        bookmarks: s.bookmarks,
        session: s.session,
        lastResult: s.lastResult,
      }),
    }
  )
);
