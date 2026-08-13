import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  Check,
  X,
  CheckCircle2,
  XCircle,
  ClipboardCopy,
} from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import type { AnswerRecord } from "../types";

export default function Practice() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const session = useAppStore((s) => s.session);
  const updateSession = useAppStore((s) => s.updateSession);
  const clearSession = useAppStore((s) => s.clearSession);
  const setLastResult = useAppStore((s) => s.setLastResult);
  const addBookmark = useAppStore((s) => s.addBookmark);
  const removeBookmark = useAppStore((s) => s.removeBookmark);
  const t = isDark ? THEME.dark : THEME.light;

  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(session?.config.timing === "timed" ? 300 : null);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      finishNow();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) selectOption(Number(e.key) - 1);
      if (e.key === "Enter") (answered ? advance : submitAnswer)();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!session) {
    return (
      <div className="py-16 text-center">
        <p style={{ color: t.textMuted }}>No practice session in progress.</p>
        <button onClick={() => navigate("/subjects")} className="mt-3 text-sm font-bold" style={{ color: t.teal }}>
          Choose a set
        </button>
      </div>
    );
  }

  const { setRef, config, queue, pos, record, bookmarked } = session;
  const isOmr = config.mode === "omr";
  const qIndex = queue[pos];
  const question = setRef.questions[qIndex];
  const totalSteps = queue.length;

  const selectOption = (i: number) => {
    if (!answered) setSelected(i);
  };

  const submitAnswer = () => {
    if (selected === null || answered) return;
    const correct = selected === question.correct;
    const newRecord = { ...record, [qIndex]: { selected, correct } };
    let newQueue = queue;
    if (!correct && config.spacedRep) {
      const insertAt = Math.min(pos + 5 + Math.floor(Math.random() * 6), queue.length);
      newQueue = [...queue];
      newQueue.splice(insertAt, 0, qIndex);
    }
    updateSession({ record: newRecord, queue: newQueue });
    if (isOmr) {
      advanceFrom(newQueue, newRecord);
    } else {
      setAnswered(true);
    }
  };

  const advanceFrom = (q: number[], rec: Record<number, AnswerRecord>) => {
    if (pos + 1 >= q.length) {
      finishNow(rec);
      return;
    }
    updateSession({ pos: pos + 1 });
    setSelected(null);
    setAnswered(false);
    setCopied(false);
  };

  const advance = () => advanceFrom(queue, record);

  const finishNow = (rec: Record<number, AnswerRecord> = record) => {
    const answers: AnswerRecord[] = setRef.questions.map((_, i) => rec[i] || { selected: null, correct: false });
    setLastResult(setRef, answers);
    clearSession();
    navigate("/results");
  };

  const toggleBookmark = () => {
    if (bookmarked[qIndex]) {
      updateSession({ bookmarked: { ...bookmarked, [qIndex]: false } });
      removeBookmark(question);
    } else {
      updateSession({ bookmarked: { ...bookmarked, [qIndex]: true } });
      addBookmark(setRef.subjectId, setRef.setId, question);
    }
  };

  const aiExplain = async () => {
    const text = `Question: ${question.q}\nMy answer: ${question.options[selected ?? 0]}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable — non-fatal */
    }
    setCopied(true);
    window.open("https://claude.ai/new", "_blank");
  };

  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, "0") : null;
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, "0") : null;

  if (isOmr) {
    return (
      <div
        className="mx-auto flex max-w-xl flex-col gap-6 rounded-[26px] p-6 md:p-9"
        style={{
          backgroundColor: t.surface,
          border: `1.5px solid ${t.border}`,
          backgroundImage: `repeating-linear-gradient(0deg, ${t.border}33 0, ${t.border}33 1px, transparent 1px, transparent 28px)`,
        }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => { clearSession(); navigate("/subjects"); }} className="flex items-center gap-1 text-sm font-bold" style={{ color: t.textMuted }}>
            <ChevronLeft size={15} /> Exit
          </button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: t.textFaint }}>
            OMR MODE \u00b7 Q{pos + 1}/{totalSteps}
          </span>
          {mm ? (
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: secondsLeft! < 30 ? t.red : t.textMuted }}>
              <Clock size={12} className="mr-1 inline" />
              {mm}:{ss}
            </span>
          ) : (
            <span style={{ width: 40 }} />
          )}
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: t.surfaceAlt }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(pos / totalSteps) * 100}%`, backgroundColor: t.purple }} />
        </div>

        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 19, lineHeight: 1.4 }}>{question.q}</h2>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectOption(i)}
              className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm"
              style={{ border: `1.5px solid ${selected === i ? t.purple : t.border}`, backgroundColor: selected === i ? `${t.purple}18` : "transparent" }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  border: `2px solid ${selected === i ? t.purple : t.textFaint}`,
                  backgroundColor: selected === i ? t.purple : "transparent",
                  color: selected === i ? "#fff" : t.textFaint,
                  fontFamily: FONT_MONO,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={toggleBookmark}>
            {bookmarked[qIndex] ? <BookmarkCheck size={18} color={t.gold} /> : <Bookmark size={18} color={t.textFaint} />}
          </button>
          <Btn t={t} onClick={submitAnswer} disabled={selected === null} icon={ArrowRight}>
            {pos + 1 >= totalSteps ? "Finish" : "Next"}
          </Btn>
        </div>
        <p className="text-center text-xs" style={{ color: t.textFaint }}>
          No feedback shown until you finish \u2014 just like a real bubble sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <button onClick={() => { clearSession(); navigate("/subjects"); }} className="flex items-center gap-1 text-sm font-bold" style={{ color: t.textMuted }}>
          <ChevronLeft size={15} /> Exit
        </button>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: t.textFaint }}>
          {pos + 1} / {totalSteps}
        </span>
        <div className="flex items-center gap-3">
          {mm && (
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: secondsLeft! < 30 ? t.red : t.textMuted }}>
              <Clock size={12} className="mr-1 inline" />
              {mm}:{ss}
            </span>
          )}
          <button onClick={toggleBookmark}>
            {bookmarked[qIndex] ? <BookmarkCheck size={18} color={t.gold} /> : <Bookmark size={18} color={t.textFaint} />}
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: t.surfaceAlt }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(pos / totalSteps) * 100}%`, backgroundColor: t.teal }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill t={t} tone={setRef.difficulty === "hard" ? "red" : setRef.difficulty === "medium" ? "gold" : "green"}>
          {setRef.difficulty}
        </Pill>
        {setRef.highYield && <Pill t={t} tone="purple">High-yield</Pill>}
        <Pill t={t} tone="muted">{setRef.moduleName}</Pill>
      </div>

      <Card t={t} style={{ padding: 24 }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, lineHeight: 1.4, marginBottom: 20 }}>{question.q}</h2>
        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correct;
            let borderColor = t.border;
            let bg = "transparent";
            if (answered) {
              if (isCorrect) {
                borderColor = t.green;
                bg = `${t.green}18`;
              } else if (isSelected) {
                borderColor = t.red;
                bg = `${t.red}18`;
              }
            } else if (isSelected) {
              borderColor = t.purple;
              bg = `${t.purple}18`;
            }
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                disabled={answered}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm"
                style={{ border: `1.5px solid ${borderColor}`, backgroundColor: bg, color: t.text }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    border: `1.5px solid ${answered && isCorrect ? t.green : isSelected ? t.purple : t.textFaint}`,
                    backgroundColor: answered && isCorrect ? t.green : isSelected && !answered ? t.purple : "transparent",
                    color: (answered && isCorrect) || (isSelected && !answered) ? "#fff" : t.textFaint,
                    fontFamily: FONT_MONO,
                  }}
                >
                  {answered ? (isCorrect ? <Check size={13} /> : isSelected ? <X size={13} /> : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
            <div className="mb-1.5 flex items-center gap-2">
              {selected === question.correct ? <CheckCircle2 size={15} color={t.green} /> : <XCircle size={15} color={t.red} />}
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13 }}>{selected === question.correct ? "Correct" : "Not quite"}</span>
            </div>
            <p style={{ color: t.textMuted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 10 }}>{question.explanation}</p>
            <button onClick={aiExplain} className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: t.teal }}>
              <ClipboardCopy size={13} /> {copied ? "Copied \u2014 opening chatbot\u2026" : "AI Explain"}
            </button>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        {!answered ? (
          <Btn t={t} onClick={submitAnswer} disabled={selected === null}>
            Submit answer
          </Btn>
        ) : (
          <Btn t={t} onClick={advance} icon={ArrowRight}>
            {pos + 1 >= totalSteps ? "See results" : "Next question"}
          </Btn>
        )}
      </div>
      <p className="hidden text-center text-xs md:block" style={{ color: t.textFaint }}>
        Keyboard: 1\u20134 to select \u00b7 Enter to submit / continue
      </p>
    </div>
  );
}
