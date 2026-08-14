import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  UploadCloud,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { SUBJECT_LIST, SUBJECT_META, TOTAL_BLOCKS } from "../data/subjects";
import {
  subscribeModules,
  createModule,
  addQuestion,
  bulkAddQuestions,
  updateQuestionStatus,
  deleteQuestion,
  subscribeSubjectQuestions,
  subscribeAllQuestions,
} from "../services/adminContent";
import { parseBracketFormat } from "../utils/parseBracketFormat";
import type { Difficulty, FirestoreQuestion, ImportResult, ModuleDoc } from "../types";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Layers },
  { id: "add", label: "Add question", icon: PlusCircle },
  { id: "import", label: "Bulk import", icon: UploadCloud },
  { id: "bank", label: "Question bank", icon: Search },
] as const;

const DIFF_TONE: Record<Difficulty, string> = { easy: "green", medium: "gold", hard: "red" };

/** Subject / module / block / difficulty picker shared by "Add question" and "Bulk import". */
function ContentContext({
  t,
  subjectId,
  setSubjectId,
  moduleId,
  setModuleId,
  block,
  setBlock,
  difficulty,
  setDifficulty,
}: {
  t: ReturnType<typeof pickTheme>;
  subjectId: string;
  setSubjectId: (v: string) => void;
  moduleId: string;
  setModuleId: (v: string) => void;
  block: number;
  setBlock: (v: number) => void;
  difficulty: Difficulty;
  setDifficulty: (v: Difficulty) => void;
}) {
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setModuleId("");
    return subscribeModules(subjectId, setModules);
  }, [subjectId, setModuleId]);

  const handleCreateModule = async () => {
    if (!newModuleName.trim()) return;
    setCreating(true);
    try {
      const id = await createModule(subjectId, newModuleName.trim(), modules.length);
      setModuleId(id);
      setNewModuleName("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
          Subject
        </span>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_LIST.map((id) => (
            <Pill key={id} t={t} tone="purple" active={subjectId === id} onClick={() => setSubjectId(id)}>
              {SUBJECT_META[id].label}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
          Module
        </span>
        {modules.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {modules.map((m) => (
              <Pill key={m.id} t={t} tone="teal" active={moduleId === m.id} onClick={() => setModuleId(m.id)}>
                {m.name}
              </Pill>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            placeholder="New module name\u2026"
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
          />
          <Btn t={t} variant="ghost" disabled={creating || !newModuleName.trim()} onClick={handleCreateModule}>
            Add
          </Btn>
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
          Block
        </span>
        <select
          value={block}
          onChange={(e) => setBlock(Number(e.target.value))}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        >
          {Array.from({ length: TOTAL_BLOCKS }, (_, i) => i + 1).map((b) => (
            <option key={b} value={b}>
              Block {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
          Difficulty tag
        </span>
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <Pill key={d} t={t} tone={DIFF_TONE[d]} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

function pickTheme() {
  return THEME.dark;
}

function AddQuestionTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [subjectId, setSubjectId] = useState<string>(SUBJECT_LIST[0]);
  const [moduleId, setModuleId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [block, setBlock] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [q, setQ] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const [modules, setModules] = useState<ModuleDoc[]>([]);

  useEffect(() => subscribeModules(subjectId, setModules), [subjectId]);
  useEffect(() => {
    setModuleName(modules.find((m) => m.id === moduleId)?.name || "");
  }, [moduleId, modules]);

  const valid = moduleId && q.trim() && options.every((o) => o.trim()) && explanation.trim();

  const submit = async () => {
    if (!valid) return;
    try {
      await addQuestion({
        subjectId,
        moduleId,
        moduleName,
        block,
        difficulty,
        q: q.trim(),
        options: options.map((o) => o.trim()),
        correct,
        explanation: explanation.trim(),
        status: "draft",
      });
      setQ("");
      setOptions(["", "", "", ""]);
      setExplanation("");
      setCorrect(0);
      setStatus("saved");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card t={t}>
        <ContentContext
          t={t}
          subjectId={subjectId}
          setSubjectId={setSubjectId}
          moduleId={moduleId}
          setModuleId={setModuleId}
          block={block}
          setBlock={setBlock}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      </Card>

      <Card t={t} className="flex flex-col gap-3">
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Question text\u2026"
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        />
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setCorrect(i)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                border: `1.5px solid ${correct === i ? t.green : t.textFaint}`,
                backgroundColor: correct === i ? t.green : "transparent",
                color: correct === i ? "#fff" : t.textFaint,
              }}
              title="Mark as correct answer"
            >
              {String.fromCharCode(65 + i)}
            </button>
            <input
              value={opt}
              onChange={(e) => setOptions(options.map((o, oi) => (oi === i ? e.target.value : o)))}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>
        ))}
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explanation shown after answering\u2026"
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        />
        <Btn t={t} full disabled={!valid} onClick={submit}>
          Save as draft
        </Btn>
        {status === "saved" && (
          <p className="text-center text-xs font-bold" style={{ color: t.green }}>
            Saved \u2014 publish it from the Question bank tab.
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-xs font-bold" style={{ color: t.red }}>
            Couldn't save. Check your Firestore rules / admin claim (see README).
          </p>
        )}
        {!moduleId && (
          <p className="text-center text-xs" style={{ color: t.textFaint }}>
            Pick or create a module on the left first.
          </p>
        )}
      </Card>
    </div>
  );
}

function BulkImportTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [subjectId, setSubjectId] = useState<string>(SUBJECT_LIST[0]);
  const [moduleId, setModuleId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [block, setBlock] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [importText, setImportText] = useState("");
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [existing, setExisting] = useState<FirestoreQuestion[]>([]);
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(0);

  useEffect(() => subscribeModules(subjectId, setModules), [subjectId]);
  useEffect(() => {
    setModuleName(modules.find((m) => m.id === moduleId)?.name || "");
  }, [moduleId, modules]);
  useEffect(() => subscribeSubjectQuestions(subjectId, setExisting), [subjectId]);

  const runImport = () => setImportResults(parseBracketFormat(importText, existing.map((e) => ({ q: e.q }))));

  const commitImport = async () => {
    if (!importResults || !moduleId) return;
    const valid = importResults.filter((r) => r.status !== "error");
    setCommitting(true);
    try {
      await bulkAddQuestions(
        valid.map((r) => ({
          subjectId,
          moduleId,
          moduleName,
          block,
          difficulty,
          q: r.q!,
          options: r.options!,
          correct: r.correct!,
          explanation: "",
          status: "draft",
        }))
      );
      setCommitted(valid.length);
      setImportText("");
      setImportResults(null);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card t={t}>
        <ContentContext
          t={t}
          subjectId={subjectId}
          setSubjectId={setSubjectId}
          moduleId={moduleId}
          setModuleId={setModuleId}
          block={block}
          setBlock={setBlock}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
        <p className="mt-3 text-xs" style={{ color: t.textFaint }}>
          Every question pasted below is imported into the module/block/difficulty selected above. Explanations aren't
          part of the bracket format \u2014 add them per-question afterwards from the Question bank tab if you want them.
        </p>
      </Card>

      <div className="flex flex-col gap-4">
        <Card t={t}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
            Bracket format
          </p>
          <pre style={{ fontFamily: FONT_MONO, fontSize: 12, color: t.textMuted, whiteSpace: "pre-wrap" }}>
            {`[Question text ; Option A | Option B | *Option C | Option D]`}
          </pre>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste a block of MCQs in bracket format\u2026"
            rows={7}
            className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text, fontFamily: FONT_MONO }}
          />
          <div className="mt-3 flex gap-2">
            <Btn t={t} onClick={runImport} disabled={!importText.trim()} icon={UploadCloud}>
              Validate
            </Btn>
            {importResults && importResults.some((r) => r.status !== "error") && (
              <Btn t={t} variant="secondary" disabled={!moduleId || committing} onClick={commitImport}>
                {committing ? "Importing\u2026" : "Import valid entries"}
              </Btn>
            )}
          </div>
          {!moduleId && importResults && (
            <p className="mt-2 text-xs" style={{ color: t.gold }}>
              Pick or create a module before importing.
            </p>
          )}
          {committed > 0 && (
            <p className="mt-2 text-xs font-bold" style={{ color: t.green }}>
              Imported {committed} question{committed !== 1 ? "s" : ""} as drafts.
            </p>
          )}
        </Card>

        {importResults && (
          <Card t={t}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              {importResults.filter((r) => r.status === "valid").length} valid \u00b7{" "}
              {importResults.filter((r) => r.status === "warning").length} possible duplicate \u00b7{" "}
              {importResults.filter((r) => r.status === "error").length} error
            </p>
            <div className="flex flex-col gap-2">
              {importResults.map((r) => (
                <div key={r.line} className="flex items-start gap-2 rounded-xl p-2.5 text-xs" style={{ backgroundColor: t.surfaceAlt }}>
                  {r.status === "valid" && <CheckCircle2 size={14} color={t.green} className="mt-0.5 shrink-0" />}
                  {r.status === "warning" && <AlertTriangle size={14} color={t.gold} className="mt-0.5 shrink-0" />}
                  {r.status === "error" && <XCircle size={14} color={t.red} className="mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <span style={{ color: t.textFaint, fontFamily: FONT_MONO }}>Line {r.line}: </span>
                    <span style={{ color: t.text }}>{r.message}</span>
                    {r.q && (
                      <div className="mt-0.5 truncate" style={{ color: t.textMuted }}>
                        {r.q}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function QuestionBankTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [subjectId, setSubjectId] = useState<string>(SUBJECT_LIST[0]);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<FirestoreQuestion[]>([]);
  const [modules, setModules] = useState<ModuleDoc[]>([]);

  useEffect(() => subscribeSubjectQuestions(subjectId, setQuestions), [subjectId]);
  useEffect(() => subscribeModules(subjectId, setModules), [subjectId]);

  const filtered = questions.filter((q) => {
    if (moduleFilter !== "all" && q.moduleId !== moduleFilter) return false;
    if (blockFilter !== "all" && q.block !== Number(blockFilter)) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search && !q.q.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SUBJECT_LIST.map((id) => (
          <Pill key={id} t={t} tone="purple" active={subjectId === id} onClick={() => setSubjectId(id)}>
            {SUBJECT_META[id].label}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}>
          <option value="all">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}>
          <option value="all">All blocks</option>
          {Array.from({ length: TOTAL_BLOCKS }, (_, i) => i + 1).map((b) => (
            <option key={b} value={b}>
              Block {b}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <Search size={15} color={t.textFaint} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question text\u2026" className="w-full bg-transparent text-sm outline-none" style={{ color: t.text }} />
      </div>

      {filtered.length === 0 && <p style={{ color: t.textFaint, fontSize: 13 }}>No questions match.</p>}
      {filtered.map((q) => (
        <Card key={q.id} t={t} className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Pill t={t} tone="muted">{q.moduleName}</Pill>
              <Pill t={t} tone="muted">Block {q.block}</Pill>
              <Pill t={t} tone={DIFF_TONE[q.difficulty]}>{q.difficulty}</Pill>
              <Pill t={t} tone={q.status === "published" ? "green" : "gold"}>{q.status}</Pill>
            </div>
            <p className="text-sm font-bold">{q.q}</p>
            <p className="text-xs" style={{ color: t.textFaint }}>Correct: {q.options[q.correct]}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button onClick={() => updateQuestionStatus(q.id, q.status === "draft" ? "published" : "draft")} title="Toggle draft/published">
              {q.status === "published" ? <Eye size={16} color={t.green} /> : <EyeOff size={16} color={t.textFaint} />}
            </button>
            <button onClick={() => deleteQuestion(q.id)}>
              <Trash2 size={16} color={t.red} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function DashboardTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [all, setAll] = useState<FirestoreQuestion[]>([]);
  useEffect(() => subscribeAllQuestions(setAll), []);

  const stats = useMemo(() => {
    const bySubject: Record<string, { published: number; draft: number }> = {};
    SUBJECT_LIST.forEach((id) => (bySubject[id] = { published: 0, draft: 0 }));
    all.forEach((q) => {
      if (!bySubject[q.subjectId]) return;
      bySubject[q.subjectId][q.status === "published" ? "published" : "draft"] += 1;
    });
    return bySubject;
  }, [all]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {SUBJECT_LIST.map((id, i) => (
        <Card key={id} t={t}>
          <div className="mb-1 flex items-center justify-between">
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>{SUBJECT_META[id].label}</span>
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.chip[i % t.chip.length] }} />
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700 }}>{stats[id].published}</div>
          <span style={{ fontSize: 11, color: t.textFaint }}>published \u00b7 {stats[id].draft} draft</span>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isAdmin = useAppStore((s) => s.isAdmin);
  const exitAdmin = useAppStore((s) => s.exitAdmin);
  const uid = useAppStore((s) => s.uid);
  const t = isDark ? THEME.dark : THEME.light;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("dashboard");

  useEffect(() => {
    if (!isAdmin) navigate("/admin-gate");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>Admin panel</h1>
          <p style={{ color: t.textMuted, fontSize: 13 }}>Not linked from the student site \u2014 staff only.</p>
        </div>
        <Btn t={t} variant="ghost" onClick={() => { exitAdmin(); navigate("/"); }}>
          Exit
        </Btn>
      </div>

      {!uid && (
        <Card t={t} style={{ borderColor: t.red, marginBottom: 16 }}>
          <p className="text-sm" style={{ color: t.red }}>
            You're not logged in with a Firebase account in this tab, so writes will be rejected by Firestore rules.
            Log in first, then make sure that account has the admin custom claim.
          </p>
        </Card>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold"
            style={{
              backgroundColor: tab === tb.id ? t.purpleStrong : t.surfaceAlt,
              color: tab === tb.id ? "#fff" : t.textMuted,
              border: `1.5px solid ${tab === tb.id ? t.purpleStrong : t.border}`,
            }}
          >
            <tb.icon size={13} /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab t={t} />}
      {tab === "add" && <AddQuestionTab t={t} />}
      {tab === "import" && <BulkImportTab t={t} />}
      {tab === "bank" && <QuestionBankTab t={t} />}
    </div>
  );
}
