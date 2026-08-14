import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Sparkles, Star, ChevronRight, Crown } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import SubjectIcon from "../components/SubjectIcon";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore, useIsLoggedIn, useIsPremium } from "../store/useAppStore";
import { SUBJECT_LIST, SUBJECT_META } from "../data/subjects";
import { db } from "../firebase";
import type { FirestoreQuestion } from "../types";

export default function Subjects() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isLoggedIn = useIsLoggedIn();
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;

  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const q = query(collection(db, "questions"), where("status", "==", "published"));
    const unsub = onSnapshot(q, (snap) => {
      const next: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data() as FirestoreQuestion;
        next[data.subjectId] = (next[data.subjectId] || 0) + 1;
      });
      setCounts(next);
    });
    return unsub;
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, marginBottom: 4 }}>Subjects</h1>
      <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 18 }}>Pick a subject, then a module, then a block.</p>

      {!isPremium && (
        <Card t={t} style={{ backgroundColor: t.purpleDeep, borderColor: t.purple, marginBottom: 20 }}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles size={15} color={t.gold} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>Go Premium</span>
              </div>
              <p className="text-sm" style={{ color: t.textMuted }}>
                Block 1 of every module is free. Premium unlocks every block, every subject.
              </p>
            </div>
            <Btn t={t} icon={Crown} onClick={() => navigate(isLoggedIn ? "/paywall" : "/signup")}>
              {isLoggedIn ? "Upgrade" : "Create free account"}
            </Btn>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {SUBJECT_LIST.map((id, i) => {
          const meta = SUBJECT_META[id];
          const color = t.chip[i % t.chip.length];
          const qCount = counts[id] || 0;
          return (
            <Card key={id} t={t} onClick={() => navigate(`/subjects/${id}`)} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}22` }}>
                <SubjectIcon id={id} color={color} />
              </div>
              <div className="min-w-0 flex-1">
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>{meta.label}</span>
                <div>
                  <span style={{ color: t.textFaint, fontSize: 12.5 }}>{meta.tag}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden items-center gap-1 sm:flex" style={{ fontFamily: FONT_MONO, fontSize: 12, color: t.textFaint }}>
                  <Star size={11} color={t.gold} fill={t.gold} /> {qCount} Qs
                </span>
                <ChevronRight size={17} color={t.textFaint} />
              </div>
            </Card>
          );
        })}
      </div>

      {Object.keys(counts).length === 0 && (
        <Pill t={t} tone="muted" style={{ marginTop: 16 }}>
          No published questions yet \u2014 add some from the admin panel.
        </Pill>
      )}
    </div>
  );
}
