import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Card from "../components/Card";
import Btn from "../components/Btn";
import Logomark from "../components/Logomark";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { signUp, logIn, authErrorMessage } from "../services/auth";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.pathname === "/signup" ? "signup" : "login";
  const isDark = useAppStore((s) => s.isDark);
  const t = isDark ? THEME.dark : THEME.light;
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Enter an email and password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") await signUp(form.name, form.email, form.password);
      else await logIn(form.email, form.password);
      navigate("/subjects");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 pt-8">
      <div className="text-center">
        <Logomark size={34} color={t.purple} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, marginTop: 10 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>Real Firebase account \u2014 your progress syncs across devices.</p>
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
          type="email"
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
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        />
        {error && (
          <div className="flex items-start gap-2 rounded-xl p-2.5 text-xs" style={{ backgroundColor: `${t.red}18`, color: t.red }}>
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        <Btn t={t} full disabled={loading} onClick={submit}>
          {loading ? "Please wait\u2026" : mode === "login" ? "Log in" : "Sign up"}
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
