import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Flame, Crown, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_BODY, FONT_MONO } from "../theme";
import { useAppStore, useIsPremium } from "../store/useAppStore";
import { subscribeRecentAttempts } from "../services/firestore";
import { logOut } from "../services/auth";
import { SUBJECT_LIST, SUBJECT_META } from "../data/subjects";
import type { AttemptRecord } from "../types";

export default function Profile() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const uid = useAppStore((s) => s.uid);
  const email = useAppStore((s) => s.email);
  const displayName = useAppStore((s) => s.displayName);
  const profile = useAppStore((s) => s.profile);
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeRecentAttempts(uid, setAttempts);
  }, [uid]);

  const accuracyData = useMemo(() => {
    return SUBJECT_LIST.map((id) => {
      const subjectAttempts = attempts.filter((a) => a.subjectId === id);
      const totalQ = subjectAttempts.reduce((s, a) => s + a.total, 0);
      const totalCorrect = subjectAttempts.reduce((s, a) => s + a.correct, 0);
      return {
        subject: SUBJECT_META[id].label,
        accuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
        attempted: totalQ > 0,
      };
    });
  }, [attempts]);

  if (!uid) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <User size={30} color={t.purple} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21 }}>Sign in to see your profile</h1>
        <p style={{ color: t.textMuted, fontSize: 14 }}>Streaks, daily goals, and your weak-topic breakdown live here once you have an account.</p>
        <Btn t={t} onClick={() => navigate("/login")}>
          Log in
        </Btn>
      </div>
    );
  }

  const goalTarget = profile?.dailyGoalTarget ?? 50;
  const goalToday = profile?.dailyGoalDate === new Date().toISOString().slice(0, 10) ? profile?.dailyGoalCount ?? 0 : 0;
  const goalPct = Math.min(100, Math.round((goalToday / goalTarget) * 100));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
          style={{ backgroundColor: t.purpleStrong, color: "#fff", fontFamily: FONT_DISPLAY }}
        >
          {(displayName || "S").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21 }}>{displayName || "Student"}</h1>
            {isPremium && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${t.gold}22`, color: t.gold }}>
                <Crown size={10} /> PREMIUM
              </span>
            )}
          </div>
          <span style={{ color: t.textFaint, fontSize: 13 }}>{email}</span>
        </div>
        <button onClick={() => logOut()} title="Log out">
          <LogOut size={18} color={t.textFaint} />
        </button>
      </div>

      {!isPremium && (
        <Card t={t} style={{ borderColor: t.gold }} className="flex items-center justify-between gap-3">
          <div>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>You're on the free plan</span>
            <p className="text-xs" style={{ color: t.textFaint }}>Block 1 only, in every module</p>
          </div>
          <Btn t={t} icon={Crown} onClick={() => navigate("/paywall")}>
            Upgrade
          </Btn>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card t={t} className="flex items-center gap-3">
          <Flame size={22} color={t.gold} />
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700 }}>{profile?.streak ?? 0}</div>
            <div style={{ fontSize: 11, color: t.textFaint }}>day streak</div>
          </div>
        </Card>
        <Card t={t}>
          <div className="mb-1 flex items-center justify-between">
            <span style={{ fontSize: 12, color: t.textFaint }}>Daily goal</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>
              {goalToday}/{goalTarget}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: t.surfaceAlt }}>
            <div className="h-full rounded-full" style={{ width: `${goalPct}%`, backgroundColor: t.teal }} />
          </div>
        </Card>
      </div>

      <Card t={t}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Weak-topic accuracy</h3>
        {attempts.length === 0 ? (
          <p className="text-sm" style={{ color: t.textFaint }}>Practice a few blocks and your per-subject accuracy will show up here.</p>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: t.textFaint, fontSize: 11, fontFamily: FONT_BODY }} axisLine={{ stroke: t.border }} tickLine={false} />
                <YAxis tick={{ fill: t.textFaint, fontSize: 11, fontFamily: FONT_BODY }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, fontFamily: FONT_BODY, fontSize: 12 }} />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {accuracyData.map((d, i) => (
                    <Cell key={i} fill={!d.attempted ? t.border : d.accuracy < 55 ? t.red : d.accuracy < 70 ? t.gold : t.green} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
