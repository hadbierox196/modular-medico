import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import Toggle from "../components/Toggle";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { SUBJECTS, SUBJECT_META } from "../data/mockData";
import type { MCQ, PracticeConfig } from "../types";

export default function Builder() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const startSession = useAppStore((s) => s.startSession);
  const t = isDark ? THEME.dark : THEME.light;

  const [picked, setPicked] = useState<string[]>(["anatomy"]);
  const [count, setCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(false);

  const togglePick = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const available: MCQ[] = useMemo(() => {
    const qs: MCQ[] = [];
    SUBJECTS.forEach((s) => {
      if (!picked.includes(s.id)) return;
      s.modules.forEach((m) => m.sets.forEach((set) => { if (set.questions) qs.push(...set.questions); }));
    });
    return qs;
  }, [picked]);

  const generate = () => {
    if (available.length === 0) return;
    const questions = available.slice(0, count);
    const config: PracticeConfig = { mode: "traditional", timing: timeLimit ? "timed" : "untimed", spacedRep: true };
    startSession(
      {
        subjectId: "anatomy",
        moduleId: "custom",
        moduleName: "Custom quiz",
        setId: "custom-quiz",
        setTitle: "Custom quiz",
        difficulty: "medium",
        highYield: false,
        questions,
      },
      config
    );
    navigate("/practice");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26 }}>Build a custom quiz</h1>
        <p style={{ color: t.textMuted, fontSize: 14, marginTop: 2 }}>Mix subjects, set a length, generate.</p>
      </div>

      <Card t={t}>
        <span className="mb-3 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
          Subjects
        </span>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s, i) => (
            <Pill key={s.id} t={t} tone={t.chip[i % t.chip.length]} active={picked.includes(s.id)} onClick={() => togglePick(s.id)}>
              {SUBJECT_META[s.id].label}
            </Pill>
          ))}
        </div>
      </Card>

      <Card t={t} className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Question count
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 13 }}>{count}</span>
          </div>
          <input
            type="range"
            min={3}
            max={Math.max(3, available.length || 3)}
            value={Math.min(count, Math.max(3, available.length))}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full"
            style={{ ["--track-color" as string]: t.surfaceAlt, ["--thumb-color" as string]: t.gold, ["--thumb-border" as string]: t.bg }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Time limit</span>
          <Toggle t={t} checked={timeLimit} onChange={setTimeLimit} />
        </div>
        <p className="text-xs" style={{ color: t.textFaint }}>
          {available.length} authored question{available.length !== 1 ? "s" : ""} available from your selection right now.
        </p>
      </Card>

      <Btn t={t} full icon={Wand2} disabled={available.length === 0} onClick={generate}>
        Generate quiz
      </Btn>
    </div>
  );
}
