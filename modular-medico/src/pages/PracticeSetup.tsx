import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ArrowRight, ListChecks, Grid3x3, Infinity as InfinityIcon, Timer, HelpCircle, Lock } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import Segmented from "../components/Segmented";
import Toggle from "../components/Toggle";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore, useIsLoggedIn, useIsPremium } from "../store/useAppStore";
import { SUBJECT_META, isSubjectId } from "../data/subjects";
import { subscribeModules, fetchPublishedBlock } from "../services/adminContent";
import type { Difficulty, ModuleDoc, PracticeConfig } from "../types";

export default function PracticeSetup() {
  const navigate = useNavigate();
  const { subjectId = "", moduleId = "", block: blockParam = "" } = useParams();
  const block = Number(blockParam);
  const isDark = useAppStore((s) => s.isDark);
  const startSession = useAppStore((s) => s.startSession);
  const isLoggedIn = useIsLoggedIn();
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;

  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [mode, setMode] = useState<"traditional" | "omr">("traditional");
  const [timing, setTiming] = useState<"untimed" | "timed">("untimed");
  const [spacedRep, setSpacedRep] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => subscribeModules(subjectId, setModules), [subjectId]);

  const mod = modules.find((m) => m.id === moduleId);
  const locked = block !== 1 && !isPremium;

  useEffect(() => {
    if (!mod || locked) return;
    fetchPublishedBlock(subjectId, moduleId, block).then((qs) => setCount(qs.length));
  }, [mod, locked, subjectId, moduleId, block]);

  if (!isSubjectId(subjectId) || !Number.isInteger(block)) {
    return (
      <div className="py-16 text-center">
        <p style={{ color: t.textMuted }}>That block couldn't be found.</p>
        <button onClick={() => navigate("/subjects")} className="mt-3 text-sm font-bold" style={{ color: t.teal }}>
          Back to subjects
        </button>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <Lock size={26} color={t.gold} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }}>This block is Premium</h1>
        <p style={{ color: t.textMuted, fontSize: 14 }}>Block 1 of every module is free. Unlock every block with Premium.</p>
        <Btn t={t} onClick={() => navigate(isLoggedIn ? "/paywall" : "/signup")}>{isLoggedIn ? "Upgrade" : "Create free account"}</Btn>
      </div>
    );
  }

  const start = async () => {
    setLoading(true);
    const questions = await fetchPublishedBlock(subjectId, moduleId, block, difficulty === "all" ? undefined : difficulty);
    setLoading(false);
    if (questions.length === 0) return;
    const config: PracticeConfig = { mode, timing, spacedRep, difficultyFilter: difficulty };
    startSession(
      {
        subjectId,
        moduleId,
        moduleName: mod?.name || "Module",
        block,
        setTitle: `${mod?.name || "Module"} \u00b7 Block ${block}`,
        questions: questions.map((q) => ({ q: q.q, options: q.options, correct: q.correct, explanation: q.explanation })),
      },
      config
    );
    navigate("/practice");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <button onClick={() => navigate(`/subjects/${subjectId}`)} className="flex items-center gap-1 text-sm font-bold" style={{ color: t.textMuted }}>
        <ChevronLeft size={15} /> {mod?.name || "Module"}
      </button>
      <div>
        <Pill t={t} tone="muted">{SUBJECT_META[subjectId].label}</Pill>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, marginTop: 10 }}>
          {mod?.name || "Module"} \u00b7 Block {block}
        </h1>
        <p style={{ color: t.textMuted, fontSize: 13.5, marginTop: 2 }}>
          {count === null ? "Loading\u2026" : `${count} question${count !== 1 ? "s" : ""} available`}
        </p>
      </div>

      <Card t={t} className="flex flex-col gap-5">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>Format</span>
          <Segmented t={t} value={mode} onChange={(v) => setMode(v as "traditional" | "omr")} options={[{ value: "traditional", label: "Traditional", icon: ListChecks }, { value: "omr", label: "OMR sheet", icon: Grid3x3 }]} />
        </div>
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>Timing</span>
          <Segmented t={t} value={timing} onChange={(v) => setTiming(v as "untimed" | "timed")} options={[{ value: "untimed", label: "Untimed", icon: InfinityIcon }, { value: "timed", label: "Timed \u00b7 5 min", icon: Timer }]} />
        </div>
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>Difficulty</span>
          <div className="flex flex-wrap gap-2">
            {(["all", "easy", "medium", "hard"] as const).map((d) => (
              <Pill key={d} t={t} tone={d === "hard" ? "red" : d === "medium" ? "gold" : d === "easy" ? "green" : "muted"} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {d === "all" ? "All" : d}
              </Pill>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold">Spaced repetition</span>
            <button onClick={() => setShowInfo(!showInfo)}><HelpCircle size={14} color={t.textFaint} /></button>
          </div>
          <Toggle t={t} checked={spacedRep} onChange={setSpacedRep} />
        </div>
        {showInfo && (
          <p className="-mt-3 rounded-xl p-3 text-xs" style={{ backgroundColor: t.surfaceAlt, color: t.textMuted, lineHeight: 1.5 }}>
            Each question you answer wrong gets requeued once, 5\u201310 questions later, so you see it again before the set ends \u2014
            then the set always finishes and shows your results.
          </p>
        )}
      </Card>

      <Btn t={t} full icon={ArrowRight} disabled={loading || count === 0} onClick={start}>
        {loading ? "Loading\u2026" : count === 0 ? "No questions in this block yet" : "Start block"}
      </Btn>
    </div>
  );
}
