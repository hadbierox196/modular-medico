import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ArrowRight, ListChecks, Grid3x3, Infinity as InfinityIcon, Timer, HelpCircle, Lock } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import Segmented from "../components/Segmented";
import Toggle from "../components/Toggle";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore, useIsLoggedIn, useIsPremium } from "../store/useAppStore";
import { SUBJECT_META, isSubjectId, DEFAULT_BLOCK_DEFINITIONS, type BlockDefinition } from "../data/subjects";
import { subscribeBlockDefinitions, fetchPublishedBlock, fetchPublishedBlockExam, fetchPublishedModuleExam } from "../services/adminContent";
import type { Difficulty, PracticeConfig } from "../types";

export default function PracticeSetup() {
  const navigate = useNavigate();
  const { subjectId = "", moduleId = "", block: blockParam = "" } = useParams();
  const [searchParams] = useSearchParams();
  const block = Number(blockParam);
  const isDark = useAppStore((s) => s.isDark);
  const startSession = useAppStore((s) => s.startSession);
  const isLoggedIn = useIsLoggedIn();
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;

  const [blockDefs, setBlockDefs] = useState<BlockDefinition[]>(DEFAULT_BLOCK_DEFINITIONS);
  const [mode, setMode] = useState<"traditional" | "omr" | "exam">("traditional");
  const [timing, setTiming] = useState<"untimed" | "timed">("untimed");
  const [spacedRep, setSpacedRep] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  // Force strict settings in Exam mode
  useEffect(() => {
    if (mode === "exam") {
      setTiming("timed");
      setSpacedRep(false);
    }
  }, [mode]);

  useEffect(() => {
    return subscribeBlockDefinitions(setBlockDefs);
  }, []);

  const blockDef = blockDefs.find((b) => b.block === block) || DEFAULT_BLOCK_DEFINITIONS.find((b) => b.block === block);
  const targetModule = blockDef?.modules?.find((m) => m.id === moduleId);

  const isFullBlock = subjectId === "all" && (moduleId === "all" || searchParams.get("fullBlock") === "true");
  const isModuleExam = subjectId === "all" && moduleId !== "all";
  const isSubjectInModule = isSubjectId(subjectId);

  const moduleDisplayName = isFullBlock
    ? `${blockDef?.title || `Block ${block}`} (All Modules & Subjects)`
    : isModuleExam
    ? `${targetModule?.name || moduleId} (All Subjects)`
    : `${SUBJECT_META[subjectId as keyof typeof SUBJECT_META]?.label || subjectId} \u00b7 ${targetModule?.name || `Block ${block}`}`;

  const locked = block !== 1 && !isPremium;

  useEffect(() => {
    if (locked) return;
    if (isFullBlock) {
      fetchPublishedBlockExam(block).then((qs) => setCount(qs.length));
    } else if (isModuleExam) {
      fetchPublishedModuleExam(block, moduleId).then((qs) => setCount(qs.length));
    } else if (isSubjectInModule) {
      fetchPublishedBlock(subjectId, moduleId, block).then((qs) => setCount(qs.length));
    }
  }, [locked, subjectId, moduleId, block, isFullBlock, isModuleExam, isSubjectInModule]);

  if (!Number.isInteger(block) || (!isFullBlock && !isModuleExam && !isSubjectInModule)) {
    return (
      <div className="py-16 text-center">
        <p style={{ color: t.textMuted }}>That block session couldn't be found.</p>
        <button onClick={() => navigate("/subjects")} className="mt-3 text-sm font-bold" style={{ color: t.teal }}>
          Back to curriculum explorer
        </button>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <Lock size={26} color={t.gold} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }}>Unlock Block {block}</h1>
        <p style={{ color: t.textMuted, fontSize: 14 }}>
          Block 1 of every module is open by default. Unlock complete access for all blocks (1–15).
        </p>
        <Btn t={t} onClick={() => navigate(isLoggedIn ? "/paywall" : "/signup")}>
          {isLoggedIn ? "Unlock Full Access" : "Create Free Account"}
        </Btn>
      </div>
    );
  }

  const start = async () => {
    setLoading(true);
    const diff = difficulty === "all" ? undefined : difficulty;
    let questions = [];
    if (isFullBlock) {
      questions = await fetchPublishedBlockExam(block, diff);
    } else if (isModuleExam) {
      questions = await fetchPublishedModuleExam(block, moduleId, diff);
    } else {
      questions = await fetchPublishedBlock(subjectId, moduleId, block, diff);
    }
    setLoading(false);
    if (questions.length === 0) return;

    const config: PracticeConfig = { mode, timing, spacedRep, difficultyFilter: difficulty };
    const title = isFullBlock
      ? `Block ${block}: Comprehensive Exam`
      : isModuleExam
      ? `Block ${block} \u00b7 ${targetModule?.name || moduleId}`
      : `${SUBJECT_META[subjectId as keyof typeof SUBJECT_META]?.label || ""} (${targetModule?.name || `B${block}`})`;

    startSession(
      {
        subjectId: isFullBlock || isModuleExam ? "all" : subjectId,
        moduleId: isFullBlock ? `block-${block}-all` : moduleId,
        moduleName: moduleDisplayName,
        block,
        setTitle: title,
        questions: questions.map((q) => ({ q: q.q, options: q.options, correct: q.correct, explanation: q.explanation })),
      },
      config
    );
    navigate("/practice");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <button
        onClick={() => navigate("/subjects?view=block")}
        className="flex items-center gap-1 text-sm font-bold"
        style={{ color: t.textMuted }}
      >
        <ChevronLeft size={15} /> Curriculum Explorer
      </button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill t={t} tone="teal">
            Block {block}: {blockDef?.title}
          </Pill>
          {targetModule && (
            <Pill t={t} tone="purple">
              {targetModule.name}
            </Pill>
          )}
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, marginTop: 10 }}>
          {moduleDisplayName}
        </h1>
        <p style={{ color: t.textMuted, fontSize: 13.5, marginTop: 2 }}>
          {count === null ? "Checking questions\u2026" : `${count} question${count !== 1 ? "s" : ""} ready for practice`}
        </p>
      </div>

      <Card t={t} className="flex flex-col gap-5">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>Format</span>
          <Segmented
            t={t}
            value={mode}
            onChange={(v) => setMode(v as "traditional" | "omr" | "exam")}
            options={[
              { value: "traditional", label: "Traditional", icon: ListChecks },
              { value: "omr", label: "OMR sheet", icon: Grid3x3 },
              { value: "exam", label: "Mock Exam", icon: Timer },
            ]}
          />
          {mode === "exam" && (
            <p className="mt-2 text-xs" style={{ color: t.gold }}>
              Exam mode mimics real test conditions: strict timer, locked feedback, and no repetition.
            </p>
          )}
        </div>
        <div style={{ opacity: mode === "exam" ? 0.5 : 1, pointerEvents: mode === "exam" ? "none" : "auto" }}>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>Timing</span>
          <Segmented
            t={t}
            value={timing}
            onChange={(v) => setTiming(v as "untimed" | "timed")}
            options={[
              { value: "untimed", label: "Untimed", icon: InfinityIcon },
              { value: "timed", label: mode === "exam" ? "Timed (Strict)" : "Timed (5 min)", icon: Timer },
            ]}
          />
        </div>
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>Difficulty</span>
          <div className="flex flex-wrap gap-2">
            {(["all", "easy", "medium", "hard"] as const).map((d) => (
              <Pill
                key={d}
                t={t}
                tone={d === "hard" ? "red" : d === "medium" ? "gold" : d === "easy" ? "green" : "muted"}
                active={difficulty === d}
                onClick={() => setDifficulty(d)}
              >
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
            Questions answered incorrectly are intelligently rescheduled for review before the session concludes.
          </p>
        )}
      </Card>

      <Btn t={t} full icon={ArrowRight} disabled={loading || count === 0} onClick={start}>
        {loading ? "Loading\u2026" : count === 0 ? "No published questions in this set yet" : `Start Practice Session`}
      </Btn>
    </div>
  );
}
