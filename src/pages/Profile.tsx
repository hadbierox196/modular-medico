import { useNavigate } from "react-router-dom";
import { User, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_BODY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { ACCURACY_DATA } from "../data/mockData";

export default function Profile() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const displayName = useAppStore((s) => s.displayName);
  const t = isDark ? THEME.dark : THEME.light;

  if (!isLoggedIn) {
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

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
          style={{ backgroundColor: t.purpleStrong, color: "#fff", fontFamily: FONT_DISPLAY }}
        >
          {(displayName || "S").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21 }}>{displayName || "Student"}</h1>
          <span style={{ color: t.textFaint, fontSize: 13 }}>student@example.com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card t={t} className="flex items-center gap-3">
          <Flame size={22} color={t.gold} />
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700 }}>4</div>
            <div style={{ fontSize: 11, color: t.textFaint }}>day streak</div>
          </div>
        </Card>
        <Card t={t}>
          <div className="mb-1 flex items-center justify-between">
            <span style={{ fontSize: 12, color: t.textFaint }}>Daily goal</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>32/50</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: t.surfaceAlt }}>
            <div className="h-full rounded-full" style={{ width: "64%", backgroundColor: t.teal }} />
          </div>
        </Card>
      </div>

      <Card t={t}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Weak-topic accuracy</h3>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={ACCURACY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="subject" tick={{ fill: t.textFaint, fontSize: 11, fontFamily: FONT_BODY }} axisLine={{ stroke: t.border }} tickLine={false} />
              <YAxis tick={{ fill: t.textFaint, fontSize: 11, fontFamily: FONT_BODY }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, fontFamily: FONT_BODY, fontSize: 12 }} />
              <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                {ACCURACY_DATA.map((d, i) => (
                  <Cell key={i} fill={d.accuracy < 55 ? t.red : d.accuracy < 70 ? t.gold : t.green} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
