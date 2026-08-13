import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Lock } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { findSubject, SUBJECT_META } from "../data/mockData";

export default function SubjectDetail() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const isDark = useAppStore((s) => s.isDark);
  const t = isDark ? THEME.dark : THEME.light;
  const subject = findSubject(subjectId);

  if (!subject) {
    return (
      <div className="text-center py-16">
        <p style={{ color: t.textMuted }}>Subject not found.</p>
        <button onClick={() => navigate("/subjects")} className="mt-3 text-sm font-bold" style={{ color: t.teal }}>
          Back to subjects
        </button>
      </div>
    );
  }

  const meta = SUBJECT_META[subject.id];

  return (
    <div>
      <button onClick={() => navigate("/subjects")} className="mb-4 flex items-center gap-1 text-sm font-bold" style={{ color: t.textMuted }}>
        <ChevronLeft size={15} /> Subjects
      </button>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, marginBottom: 2 }}>{meta.label}</h1>
      <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 22 }}>{meta.tag}</p>

      <div className="flex flex-col gap-7">
        {subject.modules.map((m) => (
          <div key={m.id}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, marginBottom: 10 }}>{m.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {m.sets.map((set) => {
                const count = set.questions ? set.questions.length : set.questionCount;
                return (
                  <Card
                    key={set.id}
                    t={t}
                    onClick={set.free ? () => navigate(`/subjects/${subject.id}/${m.id}/${set.id}`) : undefined}
                    style={!set.free ? { opacity: 0.6 } : {}}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15 }}>{set.title}</span>
                      {set.free ? <CheckCircle2 size={16} color={t.green} /> : <Lock size={14} color={t.textFaint} />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill t={t} tone={set.difficulty === "hard" ? "red" : set.difficulty === "medium" ? "gold" : "green"}>
                        {set.difficulty}
                      </Pill>
                      {set.highYield && <Pill t={t} tone="purple">High-yield</Pill>}
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: t.textFaint }}>{count} Qs</span>
                    </div>
                    {!set.free && (
                      <p className="mt-2 text-xs" style={{ color: t.textFaint }}>
                        Sign up to unlock this set
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
