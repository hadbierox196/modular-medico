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
  BookOpen,
  LayoutGrid,
  Check,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import {
  SUBJECT_LIST,
  SUBJECT_META,
  MASTER_MODULES,
  TOTAL_BLOCKS,
  DEFAULT_BLOCK_DEFINITIONS,
  type SubjectId,
  type BlockDefinition,
} from "../data/subjects";
import {
  subscribeModules,
  saveSubjectModules,
  addQuestion,
  bulkAddQuestions,
  updateQuestionStatus,
  deleteQuestion,
  subscribeSubjectQuestions,
  subscribeAllQuestions,
  subscribeBlockDefinitions,
  saveBlockDefinitions,
} from "../services/adminContent";
import { parseBracketFormat } from "../utils/parseBracketFormat";
import type { Difficulty, FirestoreQuestion, ImportResult, ModuleDoc } from "../types";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Layers },
  { id: "mcq_block", label: "Add MCQ (Block > Subject)", icon: PlusCircle },
  { id: "block_config", label: "Block Curriculum Builder", icon: Settings },
  { id: "mcq_module", label: "MCQ Module Wise", icon: LayoutGrid },
  { id: "subject_modules", label: "Subject Modules", icon: BookOpen },
  { id: "import", label: "Bulk Import", icon: UploadCloud },
  { id: "bank", label: "Question Bank", icon: Search },
] as const;

const DIFF_TONE: Record<Difficulty, string> = { easy: "green", medium: "gold", hard: "red" };

function pickTheme() {
  return THEME.dark;
}

/* ========================================================================= */
/* 1. PRIMARY AUTHORING TAB: MCQ BLOCK > MODULE > SUBJECT WISE              */
/* ========================================================================= */
function McqBlockWiseTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [blockDefs, setBlockDefs] = useState<BlockDefinition[]>(DEFAULT_BLOCK_DEFINITIONS);
  const [selectedBlock, setSelectedBlock] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("b1-m1");
  const [subjectId, setSubjectId] = useState<SubjectId>("gross_anatomy");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  // Question content fields
  const [q, setQ] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const [inputMode, setInputMode] = useState<"form" | "bracket">("form");
  const [bracketText, setBracketText] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);

  useEffect(() => {
    return subscribeBlockDefinitions(setBlockDefs);
  }, []);

  const currentBlockDef = useMemo(() => {
    return blockDefs.find((b) => b.block === selectedBlock) || DEFAULT_BLOCK_DEFINITIONS[0];
  }, [blockDefs, selectedBlock]);

  const blockModules = useMemo(() => {
    return currentBlockDef.modules || [];
  }, [currentBlockDef]);

  // When block changes, ensure selectedModuleId is valid
  useEffect(() => {
    if (blockModules.length > 0) {
      if (!blockModules.some((m) => m.id === selectedModuleId)) {
        setSelectedModuleId(blockModules[0].id);
      }
    }
  }, [selectedBlock, blockModules, selectedModuleId]);

  const currentModule = useMemo(() => {
    return blockModules.find((m) => m.id === selectedModuleId) || blockModules[0];
  }, [blockModules, selectedModuleId]);

  const moduleSubjects = useMemo(() => {
    return currentModule?.subjects || [];
  }, [currentModule]);

  // When module changes, ensure subjectId is valid for this module
  useEffect(() => {
    if (moduleSubjects.length > 0 && !moduleSubjects.includes(subjectId)) {
      setSubjectId(moduleSubjects[0]);
    }
  }, [moduleSubjects, subjectId]);

  const currentModuleName = currentModule?.name || "Module";
  const validForm = q.trim() && options.every((o) => o.trim()) && explanation.trim();

  const handleSaveForm = async () => {
    if (!validForm) return;
    try {
      await addQuestion({
        subjectId,
        moduleId: selectedModuleId,
        moduleName: currentModuleName,
        block: selectedBlock,
        difficulty,
        q: q.trim(),
        options: options.map((o) => o.trim()),
        correct,
        explanation: explanation.trim(),
        status: publishImmediately ? "published" : "draft",
      });
      setQ("");
      setOptions(["", "", "", ""]);
      setExplanation("");
      setCorrect(0);
      setStatus("saved");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    }
  };

  const handleSaveBracket = async () => {
    if (!bracketText.trim()) return;
    const parsed = parseBracketFormat(bracketText);
    const valid = parsed.filter((p) => p.status !== "error" && p.q && p.options && p.correct !== undefined);
    if (valid.length === 0) return;

    try {
      await bulkAddQuestions(
        valid.map((v) => ({
          subjectId,
          moduleId: selectedModuleId,
          moduleName: currentModuleName,
          block: selectedBlock,
          difficulty,
          q: v.q!,
          options: v.options!,
          correct: v.correct!,
          explanation: "",
          status: publishImmediately ? "published" : "draft",
        }))
      );
      setBracketText("");
      setStatus("saved");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
          Add MCQ — Block &gt; Module &gt; Subject Architecture
        </h2>
        <p style={{ color: t.textMuted, fontSize: 13 }}>
          Step 1: Choose Block (1–15) &rarr; Step 2: Choose Module in Block &rarr; Step 3: Choose Subject in Module &rarr; Step 4: Enter Questions.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left Column: Block, Module & Subject Selector */}
        <Card t={t} className="flex flex-col gap-4 lg:col-span-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                1. Select Block (1–15)
              </span>
              <span className="text-xs font-semibold" style={{ color: t.teal }}>
                {currentBlockDef.year}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: TOTAL_BLOCKS }, (_, i) => i + 1).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBlock(b)}
                  className="rounded-xl py-2 text-xs font-bold transition-all text-center"
                  style={{
                    backgroundColor: selectedBlock === b ? t.purpleStrong : t.surfaceAlt,
                    color: selectedBlock === b ? "#fff" : t.textMuted,
                    border: `1.5px solid ${selectedBlock === b ? t.purpleStrong : t.border}`,
                  }}
                >
                  B{b}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-medium" style={{ color: t.textMuted }}>
              <span className="font-bold text-white">Block {currentBlockDef.block}:</span> {currentBlockDef.title}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                2. Select Module in Block {selectedBlock}
              </span>
              <span style={{ color: t.teal, fontSize: 11 }}>
                {blockModules.length} {blockModules.length === 1 ? "module" : "modules"}
              </span>
            </div>

            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            >
              {blockModules.map((m, idx) => (
                <option key={m.id} value={m.id}>
                  Module {idx + 1}: {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                3. Subject in Module
              </span>
              <span style={{ color: t.teal, fontSize: 11 }}>
                {moduleSubjects.length} subjects in module
              </span>
            </div>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value as SubjectId)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            >
              <optgroup label={`Subjects in ${currentModuleName}`}>
                {moduleSubjects.map((id) => (
                  <option key={id} value={id}>
                    {SUBJECT_META[id]?.label || id}
                  </option>
                ))}
              </optgroup>
              {SUBJECT_LIST.some((id) => !moduleSubjects.includes(id)) && (
                <optgroup label="Other MBBS Subjects">
                  {SUBJECT_LIST.filter((id) => !moduleSubjects.includes(id)).map((id) => (
                    <option key={id} value={id}>
                      {SUBJECT_META[id]?.label || id} (Non-standard)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Difficulty
            </span>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <Pill key={d} t={t} tone={DIFF_TONE[d]} active={difficulty === d} onClick={() => setDifficulty(d)}>
                  {d}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-xl p-3 text-xs" style={{ backgroundColor: t.surfaceAlt }}>
            <span style={{ color: t.textMuted }}>Publish immediately (Students see it live)</span>
            <input
              type="checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
              className="h-4 w-4 rounded accent-teal-500"
            />
          </div>
        </Card>

        {/* Right Column: Question Content Authoring */}
        <Card t={t} className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: t.border }}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} color={t.teal} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>
                Block {selectedBlock} &bull; {currentModuleName} &bull; {SUBJECT_META[subjectId]?.label}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode("form")}
                className="rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{
                  backgroundColor: inputMode === "form" ? t.purpleStrong : t.surfaceAlt,
                  color: inputMode === "form" ? "#fff" : t.textMuted,
                }}
              >
                Form Mode
              </button>
              <button
                onClick={() => setInputMode("bracket")}
                className="rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{
                  backgroundColor: inputMode === "bracket" ? t.purpleStrong : t.surfaceAlt,
                  color: inputMode === "bracket" ? "#fff" : t.textMuted,
                }}
              >
                Bracket Text Mode
              </button>
            </div>
          </div>

          {inputMode === "form" ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                  Question Stem
                </label>
                <textarea
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. A 28-year-old patient presents with symptoms of..."
                  rows={3}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                  Options (Click letter circle to mark the correct answer)
                </label>
                <div className="flex flex-col gap-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrect(i)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all"
                        style={{
                          border: `2px solid ${correct === i ? t.green : t.textFaint}`,
                          backgroundColor: correct === i ? t.green : "transparent",
                          color: correct === i ? "#fff" : t.textFaint,
                        }}
                        title={`Set Option ${String.fromCharCode(65 + i)} as correct`}
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
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                  Clinical Explanation &amp; Distractor Rationale
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide high-yield medical rationale and why incorrect options fail..."
                  rows={3}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
                />
              </div>

              <Btn t={t} full disabled={!validForm} onClick={handleSaveForm}>
                Save MCQ to Block {selectedBlock} &bull; {currentModuleName} &bull; {SUBJECT_META[subjectId]?.label} ({publishImmediately ? "Published" : "Draft"})
              </Btn>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: t.textMuted }}>
                Paste bracket format MCQs for Block {selectedBlock} &bull; {currentModuleName} &bull; {SUBJECT_META[subjectId]?.label}:
              </p>
              <pre
                className="rounded-xl p-3 text-xs"
                style={{ backgroundColor: t.surfaceAlt, fontFamily: FONT_MONO, color: t.teal, whiteSpace: "pre-wrap" }}
              >
                {`[Which nerve is injured in surgical neck fracture of humerus? ; *Axillary nerve | Radial nerve | Ulnar nerve | Median nerve]`}
              </pre>
              <textarea
                value={bracketText}
                onChange={(e) => setBracketText(e.target.value)}
                placeholder="Paste bracket format MCQs here..."
                rows={6}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text, fontFamily: FONT_MONO }}
              />
              <Btn t={t} full disabled={!bracketText.trim()} onClick={handleSaveBracket}>
                Save Bracket MCQs to Block {selectedBlock} &bull; {currentModuleName}
              </Btn>
            </div>
          )}

          {status === "saved" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-bold" style={{ backgroundColor: `${t.green}18`, color: t.green }}>
              <CheckCircle2 size={16} /> Question successfully saved to Block {selectedBlock} ({currentModuleName})!
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-bold" style={{ backgroundColor: `${t.red}18`, color: t.red }}>
              <XCircle size={16} /> Could not save question. Please check Firestore connection.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. BLOCK CURRICULUM CONFIGURATOR (BLOCK -> MODULE(S) -> SUBJECTS)         */
/* ========================================================================= */
function BlockCurriculumConfigTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [blockDefs, setBlockDefs] = useState<BlockDefinition[]>(DEFAULT_BLOCK_DEFINITIONS);
  const [selectedBlockNum, setSelectedBlockNum] = useState(1);
  const [selectedModIndex, setSelectedModIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    return subscribeBlockDefinitions(setBlockDefs);
  }, []);

  const activeDef = blockDefs.find((b) => b.block === selectedBlockNum) || DEFAULT_BLOCK_DEFINITIONS[0];
  const modules = activeDef.modules || [];
  const currentModule = modules[selectedModIndex] || modules[0];

  const handleToggleSubjectInModule = async (subjId: SubjectId) => {
    if (!currentModule) return;
    const isPresent = currentModule.subjects.includes(subjId);
    const updatedSubjects = isPresent
      ? currentModule.subjects.filter((s) => s !== subjId)
      : [...currentModule.subjects, subjId];

    const updatedModules = modules.map((m, idx) =>
      idx === selectedModIndex ? { ...m, subjects: updatedSubjects } : m
    );

    const nextDefs = blockDefs.map((b) =>
      b.block === selectedBlockNum ? { ...b, modules: updatedModules } : b
    );
    setBlockDefs(nextDefs);
    await saveBlockDefinitions(nextDefs);
    setStatusMsg(`Updated subjects in ${currentModule.name}`);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const handleUpdateBlockMetadata = async (field: keyof BlockDefinition, value: any) => {
    const nextDefs = blockDefs.map((b) =>
      b.block === selectedBlockNum ? { ...b, [field]: value } : b
    );
    setBlockDefs(nextDefs);
    await saveBlockDefinitions(nextDefs);
    setStatusMsg(`Saved Block ${selectedBlockNum} details`);
    setTimeout(() => setStatusMsg(""), 2000);
  };

  const handleUpdateModuleName = async (modIdx: number, newName: string) => {
    const updatedModules = modules.map((m, idx) => (idx === modIdx ? { ...m, name: newName } : m));
    const nextDefs = blockDefs.map((b) =>
      b.block === selectedBlockNum ? { ...b, modules: updatedModules } : b
    );
    setBlockDefs(nextDefs);
    await saveBlockDefinitions(nextDefs);
  };

  const handleUpdateModuleDescription = async (modIdx: number, newDesc: string) => {
    const updatedModules = modules.map((m, idx) => (idx === modIdx ? { ...m, description: newDesc } : m));
    const nextDefs = blockDefs.map((b) =>
      b.block === selectedBlockNum ? { ...b, modules: updatedModules } : b
    );
    setBlockDefs(nextDefs);
    await saveBlockDefinitions(nextDefs);
  };

  const handleAddModule = async () => {
    const newMod: BlockDefinition["modules"][number] = {
      id: `b${selectedBlockNum}-m${modules.length + 1}`,
      name: `New Module ${modules.length + 1}`,
      block: selectedBlockNum,
      description: "Clinical topics and subjects in this module.",
      subjects: ["gross_anatomy" as SubjectId, "physiology" as SubjectId],
    };
    const updatedModules = [...modules, newMod];
    const nextDefs = blockDefs.map((b) =>
      b.block === selectedBlockNum ? { ...b, modules: updatedModules } : b
    );
    setBlockDefs(nextDefs);
    setSelectedModIndex(updatedModules.length - 1);
    await saveBlockDefinitions(nextDefs);
    setStatusMsg(`Added Module to Block ${selectedBlockNum}`);
    setTimeout(() => setStatusMsg(""), 2000);
  };

  const handleRemoveModule = async (modIdx: number) => {
    if (modules.length <= 1) return;
    const updatedModules = modules.filter((_, idx) => idx !== modIdx);
    const nextDefs = blockDefs.map((b) =>
      b.block === selectedBlockNum ? { ...b, modules: updatedModules } : b
    );
    setBlockDefs(nextDefs);
    setSelectedModIndex(0);
    await saveBlockDefinitions(nextDefs);
    setStatusMsg(`Removed module from Block ${selectedBlockNum}`);
    setTimeout(() => setStatusMsg(""), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
          Block Curriculum Configurator
        </h2>
        <p style={{ color: t.textMuted, fontSize: 13 }}>
          Hierarchy: <strong>Block (1–15)</strong> &rarr; <strong>Module(s) (1 or 2 per Block)</strong> &rarr; <strong>Subjects in each Module</strong>.
        </p>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-bold" style={{ backgroundColor: `${t.green}18`, color: t.green }}>
          <CheckCircle2 size={16} /> {statusMsg}
        </div>
      )}

      {/* Block Selector 1–15 */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-15">
        {blockDefs.map((b) => {
          const isCurrent = selectedBlockNum === b.block;
          const modCount = b.modules?.length || 0;
          return (
            <button
              key={b.block}
              onClick={() => {
                setSelectedBlockNum(b.block);
                setSelectedModIndex(0);
              }}
              className="flex flex-col items-center justify-center rounded-2xl py-2.5 transition-all text-center"
              style={{
                backgroundColor: isCurrent ? t.purpleStrong : t.surfaceAlt,
                color: isCurrent ? "#fff" : t.text,
                border: `1.5px solid ${isCurrent ? t.purpleStrong : t.border}`,
              }}
            >
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14 }}>B{b.block}</span>
              <span style={{ fontSize: 10, color: isCurrent ? "#ffffffcc" : t.teal }}>
                {modCount} {modCount === 1 ? "mod" : "mods"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: Block Details & Year Assignment */}
        <Card t={t} className="flex flex-col gap-4 lg:col-span-4">
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>
            Block {activeDef.block} Details
          </span>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Block Title / Theme
            </label>
            <input
              value={activeDef.title}
              onChange={(e) => handleUpdateBlockMetadata("title", e.target.value)}
              className="w-full rounded-xl px-3.5 py-2 text-sm outline-none font-semibold"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Academic Year
            </label>
            <input
              value={activeDef.year}
              onChange={(e) => handleUpdateBlockMetadata("year", e.target.value)}
              className="w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Block Clinical Description
            </label>
            <textarea
              value={activeDef.description}
              onChange={(e) => handleUpdateBlockMetadata("description", e.target.value)}
              rows={3}
              className="w-full rounded-xl px-3.5 py-2 text-sm outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>
        </Card>

        {/* Right: Modules & Subjects inside Selected Block */}
        <Card t={t} className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: t.border }}>
            <div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>
                Modules in Block {activeDef.block} ({modules.length} Modules)
              </span>
              <p style={{ color: t.textFaint, fontSize: 12 }}>
                Each Block comprises 1 or 2 modules. In each module, configure constituent subjects.
              </p>
            </div>
            {modules.length < 3 && (
              <button
                onClick={handleAddModule}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ backgroundColor: t.teal, color: "#fff" }}
              >
                <Plus size={14} /> Add Module
              </button>
            )}
          </div>

          {/* Module Tabs in this Block */}
          <div className="flex gap-2 border-b pb-3" style={{ borderColor: t.border }}>
            {modules.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setSelectedModIndex(idx)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                style={{
                  backgroundColor: selectedModIndex === idx ? t.purpleStrong : t.surfaceAlt,
                  color: selectedModIndex === idx ? "#fff" : t.textMuted,
                  border: `1px solid ${selectedModIndex === idx ? t.purpleStrong : t.border}`,
                }}
              >
                <span>Module {idx + 1}: {m.name}</span>
                <span
                  className="rounded-full px-2 py-0.2 text-[10px]"
                  style={{ backgroundColor: selectedModIndex === idx ? "#ffffff30" : `${t.teal}20`, color: selectedModIndex === idx ? "#fff" : t.teal }}
                >
                  {m.subjects.length} subjs
                </span>
              </button>
            ))}
          </div>

          {currentModule && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                    Module Name
                  </label>
                  <input
                    value={currentModule.name}
                    onChange={(e) => handleUpdateModuleName(selectedModIndex, e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none font-semibold"
                    style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                    Module Description
                  </label>
                  <input
                    value={currentModule.description || ""}
                    onChange={(e) => handleUpdateModuleDescription(selectedModIndex, e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
                  />
                </div>
              </div>

              {/* Subjects inside this Module */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                    Subjects Taught in {currentModule.name} ({currentModule.subjects.length} Selected)
                  </span>
                  {modules.length > 1 && (
                    <button
                      onClick={() => handleRemoveModule(selectedModIndex)}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: t.red }}
                    >
                      Delete this Module
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {SUBJECT_LIST.map((id) => {
                    const isAssigned = currentModule.subjects.includes(id);
                    const meta = SUBJECT_META[id];
                    return (
                      <div
                        key={id}
                        onClick={() => handleToggleSubjectInModule(id)}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs transition-all hover:scale-[1.01]"
                        style={{
                          backgroundColor: isAssigned ? `${t.purple}25` : t.surfaceAlt,
                          border: `1.5px solid ${isAssigned ? t.purpleStrong : t.border}`,
                        }}
                      >
                        <div>
                          <span className="font-bold block text-sm" style={{ color: isAssigned ? "#fff" : t.textMuted }}>
                            {meta.label}
                          </span>
                          <span className="text-[11px]" style={{ color: t.textFaint }}>
                            {meta.tag}
                          </span>
                        </div>
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white transition-all"
                          style={{ backgroundColor: isAssigned ? t.green : `${t.border}` }}
                        >
                          {isAssigned && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 3. MCQ MODULE WISE TAB (DIRECT SUBJECT > MODULE)                         */
/* ========================================================================= */
function McqModuleWiseTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [subjectId, setSubjectId] = useState<SubjectId>(SUBJECT_LIST[0]);
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [block, setBlock] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const [q, setQ] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const [publishImmediately, setPublishImmediately] = useState(true);

  useEffect(() => {
    return subscribeModules(subjectId, (mods) => {
      setModules(mods);
      if (mods.length > 0) setModuleId(mods[0].id);
      else setModuleId("");
    });
  }, [subjectId]);

  const currentModuleName = modules.find((m) => m.id === moduleId)?.name || (moduleId ? "Module" : "");
  const validForm = moduleId && q.trim() && options.every((o) => o.trim()) && explanation.trim();

  const handleSaveForm = async () => {
    if (!validForm) return;
    try {
      await addQuestion({
        subjectId,
        moduleId,
        moduleName: currentModuleName,
        block,
        difficulty,
        q: q.trim(),
        options: options.map((o) => o.trim()),
        correct,
        explanation: explanation.trim(),
        status: publishImmediately ? "published" : "draft",
      });
      setQ("");
      setOptions(["", "", "", ""]);
      setExplanation("");
      setCorrect(0);
      setStatus("saved");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
          Add MCQ — Direct Subject &gt; Module
        </h2>
        <p style={{ color: t.textMuted, fontSize: 13 }}>
          Author questions directly under specific subject modules.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card t={t} className="flex flex-col gap-4 lg:col-span-4">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              1. Select Subject
            </span>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value as SubjectId)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            >
              {SUBJECT_LIST.map((id) => (
                <option key={id} value={id}>
                  {SUBJECT_META[id].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              2. Select Module
            </span>
            {modules.length === 0 ? (
              <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: `${t.gold}18`, color: t.gold }}>
                No modules assigned to {SUBJECT_META[subjectId].label}.
              </div>
            ) : (
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
                Block
              </span>
              <select
                value={block}
                onChange={(e) => setBlock(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
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
                Difficulty
              </span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-xl p-3 text-xs" style={{ backgroundColor: t.surfaceAlt }}>
            <span style={{ color: t.textMuted }}>Publish immediately</span>
            <input
              type="checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
              className="h-4 w-4 rounded accent-teal-500"
            />
          </div>
        </Card>

        <Card t={t} className="flex flex-col gap-4 lg:col-span-8">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Question Stem
            </label>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Question text..."
              rows={3}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Options (Select correct with circle)
            </label>
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrect(i)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all"
                    style={{
                      border: `2px solid ${correct === i ? t.green : t.textFaint}`,
                      backgroundColor: correct === i ? t.green : "transparent",
                      color: correct === i ? "#fff" : t.textFaint,
                    }}
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
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Explanation
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Clinical explanation..."
              rows={3}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>

          <Btn t={t} full disabled={!validForm} onClick={handleSaveForm}>
            Save MCQ ({publishImmediately ? "Published" : "Draft"})
          </Btn>

          {status === "saved" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-bold" style={{ backgroundColor: `${t.green}18`, color: t.green }}>
              <CheckCircle2 size={16} /> Question successfully saved!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. SUBJECT MODULES ALLOCATOR TAB (37 MASTER MODULES)                     */
/* ========================================================================= */
function SubjectModulesTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(SUBJECT_LIST[0]);
  const [currentModules, setCurrentModules] = useState<ModuleDoc[]>([]);
  const [searchMaster, setSearchMaster] = useState("");
  const [customName, setCustomName] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    return subscribeModules(selectedSubject, setCurrentModules);
  }, [selectedSubject]);

  const activeModuleNames = useMemo(() => {
    return new Set(currentModules.map((m) => m.name.toLowerCase().trim()));
  }, [currentModules]);

  const toggleMasterModule = async (masterMod: (typeof MASTER_MODULES)[number]) => {
    const isAssigned = activeModuleNames.has(masterMod.name.toLowerCase().trim());
    let next: { id: string; name: string; order: number }[];

    if (isAssigned) {
      next = currentModules
        .filter((m) => m.name.toLowerCase().trim() !== masterMod.name.toLowerCase().trim())
        .map((m, idx) => ({ id: m.id, name: m.name, order: idx }));
    } else {
      next = [
        ...currentModules.map((m, idx) => ({ id: m.id, name: m.name, order: idx })),
        { id: `${selectedSubject}-${masterMod.id}`, name: masterMod.name, order: currentModules.length },
      ];
    }

    setCurrentModules(next.map((n) => ({ ...n, subjectId: selectedSubject })));
    await saveSubjectModules(selectedSubject, next);
    setStatusMsg(`Updated modules for ${SUBJECT_META[selectedSubject].label}`);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const handleAddCustomModule = async () => {
    if (!customName.trim()) return;
    const name = customName.trim();
    if (activeModuleNames.has(name.toLowerCase())) return;

    const next = [
      ...currentModules.map((m, idx) => ({ id: m.id, name: m.name, order: idx })),
      { id: `${selectedSubject}-${Date.now()}`, name, order: currentModules.length },
    ];

    setCurrentModules(next.map((n) => ({ ...n, subjectId: selectedSubject })));
    await saveSubjectModules(selectedSubject, next);
    setCustomName("");
    setStatusMsg(`Added "${name}" to ${SUBJECT_META[selectedSubject].label}`);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const handleRemoveModule = async (moduleId: string) => {
    const next = currentModules
      .filter((m) => m.id !== moduleId)
      .map((m, idx) => ({ id: m.id, name: m.name, order: idx }));

    setCurrentModules(next.map((n) => ({ ...n, subjectId: selectedSubject })));
    await saveSubjectModules(selectedSubject, next);
    setStatusMsg(`Module removed from ${SUBJECT_META[selectedSubject].label}`);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const filteredMaster = MASTER_MODULES.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMaster.toLowerCase()) ||
      String(m.num).includes(searchMaster)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
          Subject Module Allocator (37 Master Modules)
        </h2>
        <p style={{ color: t.textMuted, fontSize: 13 }}>
          Decide which modules belong to which MBBS subject.
        </p>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-xl p-3 text-xs font-bold" style={{ backgroundColor: `${t.green}18`, color: t.green }}>
          <CheckCircle2 size={16} /> {statusMsg}
        </div>
      )}

      {/* Subject Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {SUBJECT_LIST.map((id) => (
          <Pill
            key={id}
            t={t}
            tone="purple"
            active={selectedSubject === id}
            onClick={() => setSelectedSubject(id)}
          >
            {SUBJECT_META[id].label}
          </Pill>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card t={t} className="flex flex-col gap-3 lg:col-span-5">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: t.border }}>
            <div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>
                {SUBJECT_META[selectedSubject].label}
              </span>
              <p style={{ color: t.textFaint, fontSize: 12 }}>
                {currentModules.length} Active Assigned Module{currentModules.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {currentModules.length === 0 ? (
            <p className="py-6 text-center text-xs" style={{ color: t.textFaint }}>
              No modules assigned yet. Select from the 37 Master Modules on the right.
            </p>
          ) : (
            <div className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pr-1">
              {currentModules.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl p-2.5 text-xs transition-all"
                  style={{ backgroundColor: t.surfaceAlt, border: `1px solid ${t.border}` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: `${t.purple}30`, color: t.purple }}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold" style={{ color: t.text }}>
                      {m.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(m.id)}
                    className="p-1 text-xs hover:opacity-80"
                    style={{ color: t.red }}
                    title="Remove module"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 border-t pt-3" style={{ borderColor: t.border }}>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Add Custom Module Name
            </span>
            <div className="flex gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Custom module title..."
                className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
              />
              <Btn t={t} variant="secondary" disabled={!customName.trim()} onClick={handleAddCustomModule}>
                <Plus size={14} /> Add
              </Btn>
            </div>
          </div>
        </Card>

        <Card t={t} className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: t.border }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>
              Master Modules Catalog (1–37)
            </span>
            <input
              value={searchMaster}
              onChange={(e) => setSearchMaster(e.target.value)}
              placeholder="Search 37 modules..."
              className="rounded-xl px-3 py-1.5 text-xs outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            />
          </div>

          <div className="grid max-h-[520px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredMaster.map((master) => {
              const isAssigned = activeModuleNames.has(master.name.toLowerCase().trim());
              return (
                <div
                  key={master.id}
                  onClick={() => toggleMasterModule(master)}
                  className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs transition-all"
                  style={{
                    backgroundColor: isAssigned ? `${t.purple}20` : t.surfaceAlt,
                    border: `1.5px solid ${isAssigned ? t.purple : t.border}`,
                  }}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="mr-1.5 font-bold" style={{ color: isAssigned ? t.purple : t.textFaint }}>
                      {master.num}.
                    </span>
                    <span className={isAssigned ? "font-bold text-white" : "text-gray-300"}>
                      {master.name}
                    </span>
                  </div>
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white transition-all"
                    style={{ backgroundColor: isAssigned ? t.green : `${t.border}` }}
                  >
                    {isAssigned && <Check size={12} />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 5. BULK IMPORT TAB                                                       */
/* ========================================================================= */
function BulkImportTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [subjectId, setSubjectId] = useState<SubjectId>(SUBJECT_LIST[0]);
  const [moduleId, setModuleId] = useState("");
  const [block, setBlock] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [importText, setImportText] = useState("");
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [existing, setExisting] = useState<FirestoreQuestion[]>([]);
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(0);

  useEffect(() => {
    return subscribeModules(subjectId, (mods) => {
      setModules(mods);
      if (mods.length > 0) setModuleId(mods[0].id);
      else setModuleId("");
    });
  }, [subjectId]);

  useEffect(() => subscribeSubjectQuestions(subjectId, setExisting), [subjectId]);

  const currentModuleName = modules.find((m) => m.id === moduleId)?.name || "General Block Topic";

  const runImport = () => setImportResults(parseBracketFormat(importText, existing.map((e) => ({ q: e.q }))));

  const commitImport = async () => {
    if (!importResults) return;
    const valid = importResults.filter((r) => r.status !== "error");
    setCommitting(true);
    try {
      await bulkAddQuestions(
        valid.map((r) => ({
          subjectId,
          moduleId: moduleId || `${subjectId}-block-${block}`,
          moduleName: currentModuleName,
          block,
          difficulty,
          q: r.q!,
          options: r.options!,
          correct: r.correct!,
          explanation: "",
          status: "published",
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
    <div className="grid gap-5 md:grid-cols-2">
      <Card t={t} className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
            1. Target Subject
          </span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value as SubjectId)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
          >
            {SUBJECT_LIST.map((id) => (
              <option key={id} value={id}>
                {SUBJECT_META[id].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
            2. Target Module
          </span>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
          >
            <option value="">(General / Block Topic)</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              Block (1–15)
            </span>
            <select
              value={block}
              onChange={(e) => setBlock(Number(e.target.value))}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
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
              Difficulty
            </span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card t={t}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
            Bracket Format Syntax
          </p>
          <pre
            className="rounded-xl p-3 text-xs"
            style={{ fontFamily: FONT_MONO, backgroundColor: t.surfaceAlt, color: t.textMuted, whiteSpace: "pre-wrap" }}
          >
            {`[Question stem text ; Option A | Option B | *Option C | Option D]`}
          </pre>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste bulk batch of MCQs in bracket format..."
            rows={7}
            className="mt-3 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text, fontFamily: FONT_MONO }}
          />
          <div className="mt-3 flex gap-2">
            <Btn t={t} onClick={runImport} disabled={!importText.trim()} icon={UploadCloud}>
              Validate Format
            </Btn>
            {importResults && importResults.some((r) => r.status !== "error") && (
              <Btn t={t} variant="secondary" disabled={committing} onClick={commitImport}>
                {committing ? "Importing..." : `Import ${importResults.filter((r) => r.status !== "error").length} Questions`}
              </Btn>
            )}
          </div>
          {committed > 0 && (
            <p className="mt-2 text-xs font-bold" style={{ color: t.green }}>
              Successfully imported {committed} question{committed !== 1 ? "s" : ""} as published.
            </p>
          )}
        </Card>

        {importResults && (
          <Card t={t}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: t.textFaint }}>
              {importResults.filter((r) => r.status === "valid").length} valid &bull;{" "}
              {importResults.filter((r) => r.status === "warning").length} warning &bull;{" "}
              {importResults.filter((r) => r.status === "error").length} error
            </p>
            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
              {importResults.map((r) => (
                <div key={r.line} className="flex items-start gap-2 rounded-xl p-2.5 text-xs" style={{ backgroundColor: t.surfaceAlt }}>
                  {r.status === "valid" && <CheckCircle2 size={14} color={t.green} className="mt-0.5 shrink-0" />}
                  {r.status === "warning" && <AlertTriangle size={14} color={t.gold} className="mt-0.5 shrink-0" />}
                  {r.status === "error" && <XCircle size={14} color={t.red} className="mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <span style={{ color: t.textFaint, fontFamily: FONT_MONO }}>Line {r.line}: </span>
                    <span style={{ color: t.text }}>{r.message}</span>
                    {r.q && <div className="mt-0.5 truncate text-gray-400">{r.q}</div>}
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

/* ========================================================================= */
/* 6. QUESTION BANK TAB                                                     */
/* ========================================================================= */
function QuestionBankTab({ t }: { t: ReturnType<typeof pickTheme> }) {
  const [subjectId, setSubjectId] = useState<SubjectId | "all">("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [allQuestions, setAllQuestions] = useState<FirestoreQuestion[]>([]);

  useEffect(() => subscribeAllQuestions(setAllQuestions), []);

  const filtered = allQuestions.filter((q) => {
    if (subjectId !== "all" && q.subjectId !== subjectId) return false;
    if (blockFilter !== "all" && q.block !== Number(blockFilter)) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search && !q.q.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Subject Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <Pill key="all" t={t} tone="purple" active={subjectId === "all"} onClick={() => setSubjectId("all")}>
          All Subjects ({allQuestions.length})
        </Pill>
        {SUBJECT_LIST.map((id) => (
          <Pill key={id} t={t} tone="purple" active={subjectId === id} onClick={() => setSubjectId(id)}>
            {SUBJECT_META[id].label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-xs"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        >
          <option value="all">All Blocks (1–15)</option>
          {Array.from({ length: TOTAL_BLOCKS }, (_, i) => i + 1).map((b) => (
            <option key={b} value={b}>
              Block {b}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-xs"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <Search size={15} color={t.textFaint} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question bank text..."
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: t.text }}
        />
      </div>

      <div className="flex items-center justify-between py-1 text-xs" style={{ color: t.textFaint }}>
        <span>Showing {filtered.length} question{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 && <p style={{ color: t.textFaint, fontSize: 13 }}>No questions match this filter.</p>}
      {filtered.map((q) => (
        <Card key={q.id} t={t} className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Pill t={t} tone="purple">{SUBJECT_META[q.subjectId as SubjectId]?.label || q.subjectId}</Pill>
              <Pill t={t} tone="muted">Block {q.block}</Pill>
              <Pill t={t} tone="muted">{q.moduleName}</Pill>
              <Pill t={t} tone={DIFF_TONE[q.difficulty]}>{q.difficulty}</Pill>
              <Pill t={t} tone={q.status === "published" ? "green" : "gold"}>{q.status}</Pill>
            </div>
            <p className="text-sm font-bold">{q.q}</p>
            <p className="mt-1 text-xs font-semibold" style={{ color: t.green }}>
              Correct: {q.options[q.correct]}
            </p>
            {q.explanation && (
              <p className="mt-1 text-xs text-gray-400">
                <span className="font-semibold text-gray-300">Exp:</span> {q.explanation}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              onClick={() => updateQuestionStatus(q.id, q.status === "draft" ? "published" : "draft")}
              title="Toggle draft/published"
              className="p-1"
            >
              {q.status === "published" ? <Eye size={16} color={t.green} /> : <EyeOff size={16} color={t.textFaint} />}
            </button>
            <button onClick={() => deleteQuestion(q.id)} className="p-1" title="Delete question">
              <Trash2 size={16} color={t.red} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ========================================================================= */
/* 7. DASHBOARD TAB                                                         */
/* ========================================================================= */
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

  const totalPublished = Object.values(stats).reduce((acc, curr) => acc + curr.published, 0);
  const totalDraft = Object.values(stats).reduce((acc, curr) => acc + curr.draft, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card t={t}>
          <span style={{ fontSize: 12, color: t.textFaint }}>Total Questions</span>
          <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, marginTop: 4 }}>
            {totalPublished + totalDraft}
          </div>
        </Card>
        <Card t={t}>
          <span style={{ fontSize: 12, color: t.green }}>Published Questions</span>
          <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, marginTop: 4, color: t.green }}>
            {totalPublished}
          </div>
        </Card>
        <Card t={t}>
          <span style={{ fontSize: 12, color: t.gold }}>Drafts</span>
          <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, marginTop: 4, color: t.gold }}>
            {totalDraft}
          </div>
        </Card>
      </div>

      <div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
          12 MBBS Subjects Breakdown
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {SUBJECT_LIST.map((id, i) => (
            <Card key={id} t={t}>
              <div className="mb-1 flex items-center justify-between">
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>
                  {SUBJECT_META[id].label}
                </span>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.chip[i % t.chip.length] }} />
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700 }}>
                {stats[id]?.published || 0}
              </div>
              <span style={{ fontSize: 11, color: t.textFaint }}>
                published &bull; {stats[id]?.draft || 0} draft
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MAIN ADMIN PANEL CONTAINER                                                */
/* ========================================================================= */
export default function AdminPanel() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isAdmin = useAppStore((s) => s.isAdmin);
  const exitAdmin = useAppStore((s) => s.exitAdmin);
  const email = useAppStore((s) => s.email);
  const t = isDark ? THEME.dark : THEME.light;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("mcq_block");

  useEffect(() => {
    if (!isAdmin) navigate("/admin-gate");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>Admin Panel</h1>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: `${t.purple}25`, color: t.purple }}>
              {email ? `Staff: ${email}` : "Admin Access"}
            </span>
          </div>
          <p style={{ color: t.textMuted, fontSize: 13 }}>
            MBBS modular curriculum manager &bull; Blocks 1–15 &bull; 12 Subjects &bull; 37 Modules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn t={t} variant="ghost" onClick={() => navigate("/subjects")}>
            Student View
          </Btn>
          <Btn
            t={t}
            variant="ghost"
            onClick={() => {
              exitAdmin();
              navigate("/");
            }}
          >
            Exit Admin
          </Btn>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all"
            style={{
              backgroundColor: tab === tb.id ? t.purpleStrong : t.surfaceAlt,
              color: tab === tb.id ? "#fff" : t.textMuted,
              border: `1.5px solid ${tab === tb.id ? t.purpleStrong : t.border}`,
            }}
          >
            <tb.icon size={14} /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab t={t} />}
      {tab === "mcq_block" && <McqBlockWiseTab t={t} />}
      {tab === "block_config" && <BlockCurriculumConfigTab t={t} />}
      {tab === "mcq_module" && <McqModuleWiseTab t={t} />}
      {tab === "subject_modules" && <SubjectModulesTab t={t} />}
      {tab === "import" && <BulkImportTab t={t} />}
      {tab === "bank" && <QuestionBankTab t={t} />}
    </div>
  );
}
