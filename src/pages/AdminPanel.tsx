import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Search, UploadCloud, CheckCircle2, AlertTriangle, XCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { SUBJECTS, SUBJECT_META, totalQuestions } from "../data/mockData";
import { parseBracketFormat } from "../utils/parseBracketFormat";
import type { ImportResult } from "../types";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Layers },
  { id: "bank", label: "Question bank", icon: Search },
  { id: "import", label: "Bulk import", icon: UploadCloud },
] as const;

export default function AdminPanel() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isAdmin = useAppStore((s) => s.isAdmin);
  const exitAdmin = useAppStore((s) => s.exitAdmin);
  const bank = useAppStore((s) => s.adminBank);
  const setAdminBank = useAppStore((s) => s.setAdminBank);
  const t = isDark ? THEME.dark : THEME.light;

  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("dashboard");
  const [search, setSearch] = useState("");
  const [importText, setImportText] = useState("");
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);

  useEffect(() => {
    if (!isAdmin) navigate("/admin-gate");
  }, [isAdmin, navigate]);

  const stats = useMemo(() => {
    const bySubject: Record<string, number> = {};
    SUBJECTS.forEach((s) => {
      bySubject[s.id] = totalQuestions(s) + bank.filter((b) => b.subject === s.id).length;
    });
    return bySubject;
  }, [bank]);

  const filteredBank = bank.filter((q) => q.q.toLowerCase().includes(search.toLowerCase()) || q.subject.includes(search.toLowerCase()));

  const runImport = () => setImportResults(parseBracketFormat(importText, bank));

  const commitImport = () => {
    if (!importResults) return;
    const valid = importResults.filter((r) => r.status !== "error");
    const newEntries = valid.map((r, idx) => ({
      id: `imp-${Date.now()}-${idx}`,
      subject: "anatomy",
      module: "Bulk import",
      q: r.q!,
      options: r.options!,
      correct: r.correct!,
      status: "draft" as const,
    }));
    setAdminBank((b) => [...newEntries, ...b]);
    setImportText("");
    setImportResults(null);
  };

  const toggleStatus = (id: string) =>
    setAdminBank((b) => b.map((q) => (q.id === id ? { ...q, status: q.status === "draft" ? "published" : "draft" } : q)));
  const removeQuestion = (id: string) => setAdminBank((b) => b.filter((q) => q.id !== id));

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

      {tab === "dashboard" && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {SUBJECTS.map((s, i) => (
            <Card key={s.id} t={t}>
              <div className="mb-1 flex items-center justify-between">
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>{SUBJECT_META[s.id].label}</span>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.chip[i % t.chip.length] }} />
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700 }}>{stats[s.id]}</div>
              <span style={{ fontSize: 11, color: t.textFaint }}>
                MCQs \u00b7 {s.modules.length} module{s.modules.length !== 1 ? "s" : ""}
              </span>
              {s.modules.length === 0 && (
                <p className="mt-2 text-xs" style={{ color: t.gold }}>
                  Thin \u2014 no modules yet
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "bank" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
            <Search size={15} color={t.textFaint} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject or keyword\u2026"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: t.text }}
            />
          </div>
          {filteredBank.length === 0 && <p style={{ color: t.textFaint, fontSize: 13 }}>No questions match.</p>}
          {filteredBank.map((q) => (
            <Card key={q.id} t={t} className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Pill t={t} tone="muted">
                    {SUBJECT_META[q.subject]?.label || q.subject}
                  </Pill>
                  <Pill t={t} tone={q.status === "published" ? "green" : "gold"}>
                    {q.status}
                  </Pill>
                </div>
                <p className="text-sm font-bold">{q.q}</p>
                <p className="text-xs" style={{ color: t.textFaint }}>
                  Correct: {q.options[q.correct]}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button onClick={() => toggleStatus(q.id)} title="Toggle draft/published">
                  {q.status === "published" ? <Eye size={16} color={t.green} /> : <EyeOff size={16} color={t.textFaint} />}
                </button>
                <button onClick={() => removeQuestion(q.id)}>
                  <Trash2 size={16} color={t.red} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "import" && (
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
                <Btn t={t} variant="secondary" onClick={commitImport}>
                  Import valid entries
                </Btn>
              )}
            </div>
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
      )}
    </div>
  );
}
