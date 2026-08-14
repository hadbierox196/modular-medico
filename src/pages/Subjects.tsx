import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  ChevronRight,
  Crown,
  BookOpen,
  Layers,
  GraduationCap,
  Play,
  ArrowRight,
  FolderTree,
  Lock,
} from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import SubjectIcon from "../components/SubjectIcon";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore, useIsLoggedIn, useIsPremium } from "../store/useAppStore";
import {
  SUBJECT_LIST,
  SUBJECT_META,
  DEFAULT_BLOCK_DEFINITIONS,
  type BlockDefinition,
} from "../data/subjects";
import { subscribeBlockDefinitions, subscribeCurriculumCounts, type CurriculumCounts } from "../services/adminContent";

export default function Subjects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("view") as "block" | "subject") || "block";

  const isDark = useAppStore((s) => s.isDark);
  const isLoggedIn = useIsLoggedIn();
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;

  const [selectedBlockNum, setSelectedBlockNum] = useState(1);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [blockDefs, setBlockDefs] = useState<BlockDefinition[]>(DEFAULT_BLOCK_DEFINITIONS);
  const [counts, setCounts] = useState<CurriculumCounts>({
    blockCounts: {},
    moduleCounts: {},
    subjectInModuleCounts: {},
    subjectTotalCounts: {},
  });

  useEffect(() => {
    return subscribeBlockDefinitions(setBlockDefs);
  }, []);

  useEffect(() => {
    return subscribeCurriculumCounts(setCounts);
  }, []);

  const setView = (v: "block" | "subject") => {
    setSearchParams({ view: v });
  };

  const currentBlockDef = blockDefs.find((b) => b.block === selectedBlockNum) || DEFAULT_BLOCK_DEFINITIONS[0];
  const modules = currentBlockDef.modules || [];
  const totalQuestionsInSelectedBlock = counts.blockCounts[selectedBlockNum] || 0;

  const YEARS = [
    { id: "all", label: "All Blocks (1–15)" },
    { id: "1st", label: "1st Year (B1–3)" },
    { id: "2nd", label: "2nd Year (B4–6)" },
    { id: "3rd", label: "3rd Year (B7–9)" },
    { id: "4th", label: "4th Year (B10–12)" },
    { id: "5th", label: "Final Year (B13–15)" },
  ];

  const filteredBlockDefs = blockDefs.filter((b) => {
    if (yearFilter === "1st") return b.block <= 3;
    if (yearFilter === "2nd") return b.block >= 4 && b.block <= 6;
    if (yearFilter === "3rd") return b.block >= 7 && b.block <= 9;
    if (yearFilter === "4th") return b.block >= 10 && b.block <= 12;
    if (yearFilter === "5th") return b.block >= 13;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Architecture Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap size={20} color={t.teal} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: t.teal }}>
              Modular Integrated MBBS Curriculum
            </span>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, marginTop: 4, marginBottom: 2 }}>
            Curriculum &amp; Block Explorer
          </h1>
          <p style={{ color: t.textMuted, fontSize: 13.5 }}>
            Hierarchy: <strong>Block</strong> &rarr; <strong>Module(s)</strong> &rarr; <strong>Subjects</strong>
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div
          className="flex rounded-2xl p-1.5 self-start sm:self-auto"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}
        >
          <button
            onClick={() => setView("block")}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === "block" ? t.purpleStrong : "transparent",
              color: activeTab === "block" ? "#fff" : t.textMuted,
            }}
          >
            <Layers size={14} /> Block &amp; Module Explorer
          </button>
          <button
            onClick={() => setView("subject")}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === "subject" ? t.purpleStrong : "transparent",
              color: activeTab === "subject" ? "#fff" : t.textMuted,
            }}
          >
            <BookOpen size={14} /> All 12 Subjects
          </button>
        </div>
      </div>

      {!isPremium && (
        <Card t={t} style={{ backgroundColor: t.purpleDeep, borderColor: t.purple }}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles size={16} color={t.gold} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16 }}>Full MBBS Access</span>
              </div>
              <p className="text-sm" style={{ color: t.textMuted }}>
                Block 1 is open for all subjects and modules. Blocks 1–15 and custom exams are unlocked with premium.
              </p>
            </div>
            <Btn t={t} icon={Crown} onClick={() => navigate(isLoggedIn ? "/paywall" : "/signup")}>
              {isLoggedIn ? "Manage Access" : "Create Free Account"}
            </Btn>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 1. PRIMARY VIEW: BLOCK & MODULE HIERARCHY                                 */}
      {/* ========================================================================= */}
      {activeTab === "block" && (
        <div className="flex flex-col gap-6">
          {/* Year Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider" style={{ color: t.textFaint }}>
              Filter Year:
            </span>
            {YEARS.map((y) => (
              <Pill
                key={y.id}
                t={t}
                active={yearFilter === y.id}
                onClick={() => setYearFilter(y.id)}
              >
                {y.label}
              </Pill>
            ))}
          </div>

          {/* Block Selector 1–15 */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-15">
            {filteredBlockDefs.map((b) => {
                  const totalInBlock = counts.blockCounts[b.block] || 0;
                  const isSelected = selectedBlockNum === b.block;
                  const isLocked = b.block !== 1 && !isPremium;
                  return (
                    <button
                      key={b.block}
                      onClick={() => setSelectedBlockNum(b.block)}
                      className="flex flex-col items-center justify-center rounded-2xl p-2.5 transition-all text-center hover:scale-[1.02] relative"
                      style={{
                        backgroundColor: isSelected ? t.purpleStrong : t.surfaceAlt,
                        color: isSelected ? "#fff" : t.text,
                        border: `1.5px solid ${isSelected ? t.purpleStrong : t.border}`,
                        boxShadow: isSelected ? `0 4px 14px ${t.purpleStrong}40` : "none",
                        opacity: isLocked ? 0.75 : 1,
                      }}
                    >
                      {isLocked && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm" style={{ backgroundColor: t.gold, color: "#fff" }}>
                          <Lock size={10} fill="#fff" />
                        </div>
                      )}
                      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>B{b.block}</span>
                  <span
                    className="truncate max-w-[65px] text-[10px] font-semibold mt-0.5"
                    style={{ color: isSelected ? "#ffffffdd" : t.teal }}
                  >
                    {b.title.split(" ")[0]}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: isSelected ? "#ffffffcc" : t.textFaint,
                      marginTop: 2,
                    }}
                  >
                    {totalInBlock} Qs
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Block Showcase Card */}
          <Card
            t={t}
            className="flex flex-col gap-6 p-6"
            style={{ backgroundColor: t.surface, border: `1.5px solid ${t.border}` }}
          >
            {/* Block Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start border-b pb-5" style={{ borderColor: t.border }}>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${t.teal}22`, color: t.teal }}
                  >
                    Block {currentBlockDef.block} of 15
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${t.purple}22`, color: isDark ? "#c084fc" : t.purpleStrong }}
                  >
                    {currentBlockDef.year}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: t.surfaceAlt, color: t.textMuted }}
                  >
                    {modules.length} {modules.length === 1 ? "Module" : "Modules"}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 font-mono text-xs font-bold"
                    style={{ backgroundColor: t.surfaceAlt, color: t.textMuted }}
                  >
                    {totalQuestionsInSelectedBlock} Total Questions
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 24,
                    marginTop: 10,
                    marginBottom: 4,
                  }}
                >
                  {currentBlockDef.title}
                </h2>
                <p style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.5, maxWidth: "750px" }}>
                  {currentBlockDef.description}
                </p>
              </div>

              {/* Start Comprehensive Full Block Exam CTA */}
              <div className="flex flex-col gap-2 shrink-0 md:w-64">
                <Btn
                  t={t}
                  full
                  icon={currentBlockDef.block !== 1 && !isPremium ? Lock : Play}
                  onClick={() => navigate(currentBlockDef.block !== 1 && !isPremium ? (isLoggedIn ? "/paywall" : "/signup") : `/subjects/all/all/${currentBlockDef.block}?fullBlock=true`)}
                >
                  {currentBlockDef.block !== 1 && !isPremium ? "Unlock Block" : `Start Block ${currentBlockDef.block} Exam`}
                </Btn>
                <span className="text-center text-[11px]" style={{ color: t.textFaint }}>
                  Full multi-module exam across all subjects in this block
                </span>
              </div>
            </div>

            {/* Modules List inside this Block */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree size={18} color={t.purple} />
                  <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18 }}>
                    Modules in Block {currentBlockDef.block} ({modules.length})
                  </h3>
                </div>
                <span className="text-xs" style={{ color: t.textFaint }}>
                  Each module contains integrated medical subjects
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {modules.map((mod, modIdx) => {
                  const modQuestions = counts.moduleCounts[`${currentBlockDef.block}-${mod.id}`] || 0;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl p-5 transition-all"
                      style={{
                        backgroundColor: t.surfaceAlt,
                        border: `1.5px solid ${t.border}`,
                      }}
                    >
                      {/* Module Header Bar */}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b pb-4 mb-4" style={{ borderColor: t.border }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                              style={{ backgroundColor: `${t.purple}22`, color: isDark ? "#d8b4fe" : t.purpleStrong }}
                            >
                              Module {modIdx + 1} of {modules.length}
                            </span>
                            <span
                              className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold"
                              style={{ backgroundColor: `${t.green}20`, color: t.green }}
                            >
                              {modQuestions} Questions
                            </span>
                          </div>
                          <h4 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18 }}>
                            {mod.name}
                          </h4>
                          {mod.description && (
                            <p style={{ color: t.textMuted, fontSize: 13, marginTop: 2 }}>
                              {mod.description}
                            </p>
                          )}
                        </div>

                        {/* Module Exam CTA */}
                        <div className="shrink-0">
                          <button
                            onClick={() => navigate(currentBlockDef.block !== 1 && !isPremium ? (isLoggedIn ? "/paywall" : "/signup") : `/subjects/all/${mod.id}/${currentBlockDef.block}`)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-[1.02]"
                            style={{
                              backgroundColor: currentBlockDef.block !== 1 && !isPremium ? t.gold : t.purpleStrong,
                              color: "#fff",
                            }}
                          >
                            {currentBlockDef.block !== 1 && !isPremium ? <Lock size={13} fill="#fff" /> : <Play size={13} fill="#fff" />}
                            {currentBlockDef.block !== 1 && !isPremium ? "Unlock Module" : `Practice Module (${mod.subjects.length} Subjects)`}
                          </button>
                        </div>
                      </div>

                      {/* Subjects in this Module */}
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider mb-2.5 block" style={{ color: t.textFaint }}>
                          Subjects taught in {mod.name}:
                        </span>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {mod.subjects.map((subjId) => {
                            const meta = SUBJECT_META[subjId];
                            const countInModule = counts.subjectInModuleCounts[`${currentBlockDef.block}-${mod.id}-${subjId}`] || 0;
                            const color = t.teal;

                            return (
                              <div
                                key={subjId}
                                onClick={() => navigate(currentBlockDef.block !== 1 && !isPremium ? (isLoggedIn ? "/paywall" : "/signup") : `/subjects/${subjId}/${mod.id}/${currentBlockDef.block}`)}
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]"
                                style={{
                                  backgroundColor: t.surface,
                                  border: `1px solid ${t.border}`,
                                }}
                              >
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl relative"
                                  style={{ backgroundColor: `${color}22` }}
                                >
                                  {currentBlockDef.block !== 1 && !isPremium && (
                                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: t.gold }}>
                                      <Lock size={8} fill="#fff" color="#fff" />
                                    </div>
                                  )}
                                  <SubjectIcon id={subjId} color={color} size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13.5 }}>
                                    {meta.label}
                                  </span>
                                  <div className="truncate text-[11px]" style={{ color: t.textFaint }}>
                                    {meta.tag}
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <span
                                    className="rounded-full px-2 py-0.5 font-mono text-[11px] font-bold"
                                    style={{
                                      backgroundColor: countInModule > 0 ? `${t.green}20` : t.surfaceAlt,
                                      color: countInModule > 0 ? t.green : t.textFaint,
                                    }}
                                  >
                                    {countInModule} Qs
                                  </span>
                                  <ArrowRight size={13} color={t.textFaint} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBJECT DIRECTORY VIEW (12 MBBS Subjects)                              */}
      {/* ========================================================================= */}
      {activeTab === "subject" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-4" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
            <p style={{ color: t.textMuted, fontSize: 13.5 }}>
              Browse each of the 12 medical subjects across all 15 Blocks and clinical modules.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECT_LIST.map((id, i) => {
              const meta = SUBJECT_META[id];
              const color = t.chip[i % t.chip.length];
              const qCount = counts.subjectTotalCounts[id] || 0;
              return (
                <Card
                  key={id}
                  t={t}
                  onClick={() => navigate(`/subjects/${id}`)}
                  className="flex cursor-pointer items-center gap-4 transition-all hover:scale-[1.01]"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    <SubjectIcon id={id} color={color} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>
                      {meta.label}
                    </span>
                    <div className="truncate text-xs" style={{ color: t.textFaint }}>
                      {meta.tag}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 font-mono text-xs font-bold"
                      style={{ backgroundColor: `${t.gold}18`, color: t.gold }}
                    >
                      {qCount} Qs
                    </span>
                    <ChevronRight size={16} color={t.textFaint} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
