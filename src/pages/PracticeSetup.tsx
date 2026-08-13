import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ArrowRight, ListChecks, Grid3x3, Infinity as InfinityIcon, Timer, HelpCircle } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import Segmented from "../components/Segmented";
import Toggle from "../components/Toggle";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { findSubject, findModule, findSet, SUBJECT_META } from "../data/mockData";
import type { PracticeConfig } from "../types";

export default function PracticeSetup() {
  const navigate = useNavigate();
  const { subjectId = "", moduleId = "", setId = "" } = useParams();
  const isDark = useAppStore((s) => s.isDark);
  const startSession = useAppStore((s) => s.startSession);
  const t = isDark ? THEME.dark : THEME.light;

  const [mode, setMode] = useState<"traditional" | "omr">("traditional");
  const [timing, setTiming] = useState<"untimed" | "timed">("untimed");
  const [spacedRep, setSpacedRep] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const subject = findSubject(subjectId);
  const mod = subject && findModule(subject, moduleId);
  const set = mod && findSet(mod, setId);

  if (!subject || !mod || !set || !set.questions) {
    return (
      <div className="text-center py-16">
        <p style={{ color: t.textMuted }}>Set not found.</p>
        <button onClick={() => navigate("/subjects")} className="mt-3 text-sm font-bold" style={{ color: t.teal }}>
          Back to subjects
        </button>
      </div>
    );
  }

  const start = () => {
    const config: PracticeConfig = { mode, timing, spacedRep };
    startSession(
      {
        subjectId: subject.id,
        moduleId: mod.id,
        moduleName: mod.name,
        setId: set.id,
        setTitle: set.title,
        difficulty: set.difficulty,
        highYield: set.highYield,
        questions: set.questions!,
      },
      config
    );
    navigate("/practice");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <button onClick={() => navigate(`/subjects/${subject.id}`)} className="flex items-center gap-1 text-sm font-bold" style={{ color: t.textMuted }}>
        <ChevronLeft size={15} /> {mod.name}
      </button>
      <div>
        <Pill t={t} tone="muted">{SUBJECT_META[subject.id].label}</Pill>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, marginTop: 10 }}>{set.title}</h1>
        <p style={{ color: t.textMuted, fontSize: 13.5, marginTop: 2 }}>
          {set.questions.length} questions \u00b7 {set.difficulty}
        </p>
      </div>

      <Card t={t} className="flex flex-col gap-5">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
            Format
          </span>
          <Segmented
            t={t}
            value={mode}
            onChange={(v) => setMode(v as "traditional" | "omr")}
            options={[
              { value: "traditional", label: "Traditional", icon: ListChecks },
              { value: "omr", label: "OMR sheet", icon: Grid3x3 },
            ]}
          />
        </div>
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
            Timing
          </span>
          <Segmented
            t={t}
            value={timing}
            onChange={(v) => setTiming(v as "untimed" | "timed")}
            options={[
              { value: "untimed", label: "Untimed", icon: InfinityIcon },
              { value: "timed", label: "Timed \u00b7 5 min", icon: Timer },
            ]}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold">Spaced repetition</span>
            <button onClick={() => setShowInfo(!showInfo)}>
              <HelpCircle size={14} color={t.textFaint} />
            </button>
          </div>
          <Toggle t={t} checked={spacedRep} onChange={setSpacedRep} />
        </div>
        {showInfo && (
          <p className="-mt-3 rounded-xl p-3 text-xs" style={{ backgroundColor: t.surfaceAlt, color: t.textMuted, lineHeight: 1.5 }}>
            Questions you answer wrong get re-inserted 5\u201310 questions later, so you see them again before the session ends.
          </p>
        )}
      </Card>

      <Btn t={t} full icon={ArrowRight} onClick={start}>
        Start set
      </Btn>
    </div>
  );
}
