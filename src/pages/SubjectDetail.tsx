import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock, Crown } from "lucide-react";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore, useIsLoggedIn, useIsPremium } from "../store/useAppStore";
import { SUBJECT_LIST, SUBJECT_META, TOTAL_BLOCKS } from "../data/subjects";
import { subscribeModules, subscribeModuleBlockCounts } from "../services/adminContent";
import type { ModuleDoc } from "../types";

function ModuleBlocks({ subjectId, mod, isPremium, isLoggedIn }: { subjectId: string; mod: ModuleDoc; isPremium: boolean; isLoggedIn: boolean }) {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const t = isDark ? THEME.dark : THEME.light;
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => subscribeModuleBlockCounts(subjectId, mod.id, setCounts), [subjectId, mod.id]);

  return (
    <div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, marginBottom: 10 }}>{mod.name}</h2>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => i + 1).map((block) => {
          const count = counts[block] || 0;
          const free = block === 1;
          const locked = !free && !isPremium;
          const empty = count === 0;
          return (
            <Card
              key={block}
              t={t}
              onClick={!empty && !locked ? () => navigate(`/subjects/${subjectId}/${mod.id}/${block}`) : locked ? () => navigate(isLoggedIn ? "/paywall" : "/signup") : undefined}
              style={{ padding: 14, textAlign: "center", opacity: empty ? 0.45 : 1 }}
            >
              <div className="mb-1 flex items-center justify-center gap-1">
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>B{block}</span>
                {locked && !empty && <Lock size={11} color={t.gold} />}
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: t.textFaint }}>{count} Qs</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function SubjectDetail() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const isDark = useAppStore((s) => s.isDark);
  const isLoggedIn = useIsLoggedIn();
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;
  const [modules, setModules] = useState<ModuleDoc[]>([]);

  useEffect(() => subscribeModules(subjectId, setModules), [subjectId]);

  if (!(SUBJECT_LIST as readonly string[]).includes(subjectId)) {
    return (
      <div className="py-16 text-center">
        <p style={{ color: t.textMuted }}>Subject not found.</p>
        <button onClick={() => navigate("/subjects")} className="mt-3 text-sm font-bold" style={{ color: t.teal }}>
          Back to subjects
        </button>
      </div>
    );
  }

  const meta = SUBJECT_META[subjectId as keyof typeof SUBJECT_META];

  return (
    <div>
      <button onClick={() => navigate("/subjects")} className="mb-4 flex items-center gap-1 text-sm font-bold" style={{ color: t.textMuted }}>
        <ChevronLeft size={15} /> Subjects
      </button>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, marginBottom: 2 }}>{meta.label}</h1>
      <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 8 }}>{meta.tag}</p>

      {!isPremium && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs" style={{ backgroundColor: `${t.gold}18`, color: t.goldDeep }}>
          <Lock size={13} /> Block 1 is free in every module. Unlock Blocks 2\u201315 with Premium.
          <button onClick={() => navigate(isLoggedIn ? "/paywall" : "/signup")} className="ml-auto font-bold underline">
            Upgrade
          </button>
        </div>
      )}

      {modules.length === 0 ? (
        <Card t={t} className="text-center">
          <p className="text-sm" style={{ color: t.textMuted }}>
            No modules published for {meta.label} yet. Check back soon, or add one from the admin panel.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {modules.map((m) => (
            <ModuleBlocks key={m.id} subjectId={subjectId} mod={m} isPremium={isPremium} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}

      {!isPremium && (
        <Btn t={t} full icon={Crown} style={{ marginTop: 24 }} onClick={() => navigate(isLoggedIn ? "/paywall" : "/signup")}>
          Unlock all blocks with Premium
        </Btn>
      )}
    </div>
  );
}
