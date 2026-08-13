import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../components/Card";
import Btn from "../components/Btn";
import Logomark from "../components/Logomark";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.pathname === "/signup" ? "signup" : "login";
  const isDark = useAppStore((s) => s.isDark);
  const logIn = useAppStore((s) => s.logIn);
  const t = isDark ? THEME.dark : THEME.light;
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = () => {
    logIn(form.name || "Student");
    navigate("/subjects");
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 pt-8">
      <div className="text-center">
        <Logomark size={34} color={t.purple} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, marginTop: 10 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>Prototype only \u2014 no real account is created.</p>
      </div>
      <Card t={t} className="flex flex-col gap-3">
        {mode === "signup" && (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
          />
        )}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        />
        <Btn t={t} full onClick={submit}>
          {mode === "login" ? "Log in" : "Sign up"}
        </Btn>
        <button onClick={() => navigate(mode === "login" ? "/signup" : "/login")} className="text-center text-xs font-bold" style={{ color: t.teal, fontFamily: FONT_MONO }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </Card>
      <button onClick={() => navigate("/")} className="text-center text-xs" style={{ color: t.textFaint }}>
        Continue as guest instead
      </button>
    </div>
  );
}
