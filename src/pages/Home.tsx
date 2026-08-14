import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Check, X, HelpCircle, ChevronRight } from "lucide-react";
import Pill from "../components/Pill";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore, useIsLoggedIn } from "../store/useAppStore";
import { SUBJECT_LIST, SUBJECT_META } from "../data/subjects";

const SCATTER_ROTATIONS = [-6, 4, -3, 7, -8];
const SCATTER_SUBJECTS = SUBJECT_LIST.map((id, i) => ({ id, rotate: SCATTER_ROTATIONS[i % SCATTER_ROTATIONS.length] }));

const FAQS = [
  { q: "What's free vs. paid?", a: "Guest mode unlocks one full practice set per subject. Signing up (free) gives full access to every subject, module, and set, plus progress tracking and spaced repetition." },
  { q: "How does spaced repetition work?", a: "Turn it on before a set starts. Any question you miss is quietly reinserted 5-10 questions later in the same session, so it resurfaces before you forget it." },
  { q: "How does AI Explain work?", a: "No AI is wired in yet — tapping it copies the question and your answer to your clipboard and opens your chatbot of choice, ready to paste." },
];

export default function Home() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isLoggedIn = useIsLoggedIn();
  const t = isDark ? THEME.dark : THEME.light;
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="flex flex-col gap-16">
      <section className="relative overflow-hidden rounded-[28px] px-6 py-12 md:px-12 md:py-16" style={{ backgroundColor: t.surface, border: `1.5px solid ${t.border}` }}>
        <div className="relative z-10 flex flex-col items-start gap-5">
          <Pill t={t} tone="teal">
            <Sparkles size={12} /> Built for MBBS exam prep
          </Pill>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(2.1rem, 6vw, 3.2rem)", lineHeight: 1.08 }}>
            Practice MCQs the way
            <br />
            your exam actually asks them.
          </h1>
          <p style={{ color: t.textMuted, fontSize: 16, maxWidth: 540, lineHeight: 1.6 }}>
            Pick a subject, choose traditional or OMR-style practice, and let spaced repetition bring back
            exactly what you got wrong — until it sticks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Btn t={t} icon={ArrowRight} onClick={() => navigate("/subjects")}>
              Start practicing free
            </Btn>
            <Btn t={t} variant="ghost" onClick={() => navigate(isLoggedIn ? "/builder" : "/login")}>
              {isLoggedIn ? "Build a custom quiz" : "Create free account"}
            </Btn>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-wrap gap-3 md:mt-16">
          {SCATTER_SUBJECTS.map((s, i) => (
            <Pill key={s.id} t={t} tone={t.chip[i % t.chip.length]} rotate={s.rotate} onClick={() => navigate("/subjects")}>
              {SUBJECT_META[s.id].label}
            </Pill>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card t={t}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18 }}>Free Trial</span>
            </div>
            <Pill t={t} tone="teal">Free</Pill>
          </div>
          <ul className="flex flex-col gap-3 text-sm" style={{ color: t.textMuted }}>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> 1 sample module per subject
            </li>
            <li className="flex items-center gap-3">
              <X size={16} color={t.red} /> Comprehensive progress analytics
            </li>
            <li className="flex items-center gap-3">
              <X size={16} color={t.red} /> Spaced repetition system
            </li>
            <li className="flex items-center gap-3">
              <X size={16} color={t.red} /> Custom quiz builder
            </li>
          </ul>
        </Card>

        <Card t={t} style={{ borderColor: t.purple }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18 }}>Subscription</span>
            </div>
            <Pill t={t} tone="purple" active>
              Premium Subscription
            </Pill>
          </div>
          <ul className="flex flex-col gap-3 text-sm" style={{ color: t.textMuted }}>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> Full access to all modules & blocks
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> Comprehensive progress analytics
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> Spaced repetition system
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> Custom quiz builder
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> Save & bookmark questions
            </li>
            <li className="flex items-center gap-3">
              <Check size={16} color={t.green} /> Weak-topic heatmap & streaks
            </li>
          </ul>
          <Btn t={t} full style={{ marginTop: 16 }} onClick={() => navigate("/paywall")}>
            Subscribe Now
          </Btn>
        </Card>
      </section>

      <section className="pb-2">
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 21, marginBottom: 14 }}>Frequently asked</h2>
        <div className="flex flex-col gap-2">
          {FAQS.map((f, i) => (
            <div key={f.q} className="rounded-2xl" style={{ backgroundColor: t.surface, border: `1.5px solid ${t.border}` }}>
              <button className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span className="flex items-center gap-2 text-sm font-bold">
                  <HelpCircle size={14} color={t.teal} /> {f.q}
                </span>
                <ChevronRight size={15} style={{ transform: openFaq === i ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} color={t.textFaint} />
              </button>
              {openFaq === i && (
                <p className="px-4 pb-4 text-sm" style={{ color: t.textMuted, lineHeight: 1.6 }}>
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
