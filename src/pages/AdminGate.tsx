import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, KeyRound } from "lucide-react";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore } from "../store/useAppStore";

const ADMIN_GATE_PASSWORD = import.meta.env.VITE_ADMIN_GATE_PASSWORD as string | undefined;

export default function AdminGate() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const enterAdmin = useAppStore((s) => s.enterAdmin);
  const t = isDark ? THEME.dark : THEME.light;
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (ADMIN_GATE_PASSWORD && pw === ADMIN_GATE_PASSWORD) {
      enterAdmin();
      navigate("/admin");
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-8 text-center pb-12">
      <ShieldCheck size={36} color={t.purple} className="mx-auto" />
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22 }}>Staff & Master Access</h1>
      <p style={{ color: t.textMuted, fontSize: 13 }}>
        Direct administrator gateway for question banking, bulk importing, and module management.
      </p>

      <Card t={t} className="flex flex-col gap-3 text-left">
        <label className="text-xs font-bold" style={{ color: t.textFaint }}>
          Admin Gate Password
        </label>
        <div className="relative">
          <input
            placeholder="••••••••"
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
          />
        </div>
        {error && <span style={{ color: t.red, fontSize: 12 }}>{error}</span>}
        <Btn t={t} full onClick={submit} icon={KeyRound}>
          Enter admin panel
        </Btn>
      </Card>

      <button onClick={() => navigate("/")} className="text-xs" style={{ color: t.textFaint }}>
        Back to student site
      </button>
    </div>
  );
}
