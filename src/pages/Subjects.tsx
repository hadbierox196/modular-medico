import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, ChevronRight } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import Segmented from "../components/Segmented";
import SubjectIcon from "../components/SubjectIcon";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { SUBJECTS, SUBJECT_META, totalQuestions } from "../data/mockData";

export default function Subjects() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const t = isDark ? THEME.dark : THEME.light;
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? SUBJECTS : SUBJECTS.filter((s) => s.modules.some((m) => m.sets.some((set) => set.highYield)));

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, marginBottom: 4 }}>Subjects</h1>
      <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 18 }}>Pick a subject to see its modules and sets.</p>

      {!isLoggedIn && (
        <Card t={t} style={{ backgroundColor: t.purpleDeep, borderColor: t.purple, marginBottom: 20 }}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles size={15} color={t.gold} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>Full library on subscription</span>
              </div>
              <p className="text-sm" style={{ color: t.textMuted }}>
                Unlock every subject, spaced repetition & streaks.
              </p>
            </div>
            <Btn t={t} onClick={() => navigate("/signup")}>
              Unlock free
            </Btn>
          </div>
        </Card>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Segmented
          t={t}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All subjects" },
            { value: "high-yield", label: "High-yield only" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((s, i) => {
          const meta = SUBJECT_META[s.id];
          const qCount = totalQuestions(s);
          const empty = s.modules.length === 0;
          const color = t.chip[i % t.chip.length];
          return (
            <Card key={s.id} t={t} onClick={!empty ? () => navigate(`/subjects/${s.id}`) : undefined} style={empty ? { opacity: 0.55 } : {}} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}22` }}>
                <SubjectIcon id={s.id} color={color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>{meta.label}</span>
                  {empty && <Pill t={t} tone="muted">Soon</Pill>}
                </div>
                <span style={{ color: t.textFaint, fontSize: 12.5 }}>{meta.tag}</span>
              </div>
              {!empty && (
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden items-center gap-1 sm:flex" style={{ fontFamily: FONT_MONO, fontSize: 12, color: t.textFaint }}>
                    <Star size={11} color={t.gold} fill={t.gold} /> {qCount} Qs
                  </span>
                  <ChevronRight size={17} color={t.textFaint} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
