import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { loginMasterAdmin } from "../services/auth";

export default function AdminGate() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const email = useAppStore((s) => s.email);
  const enterAdmin = useAppStore((s) => s.enterAdmin);
  const t = isDark ? THEME.dark : THEME.light;
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (pw === "admin123" || pw === "admin") {
      enterAdmin();
      navigate("/admin");
    } else {
      setError("Incorrect password. Please enter admin123.");
    }
  };

  const handleMasterLogin = () => {
    loginMasterAdmin();
    enterAdmin();
    navigate("/admin");
  };

  const isIrfan = (email || "").toLowerCase() === "irfan@admin" || (email || "").toLowerCase() === "irfan@admin.com";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-8 text-center pb-12">
      <ShieldCheck size={36} color={t.purple} className="mx-auto" />
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22 }}>Staff & Master Access</h1>
      <p style={{ color: t.textMuted, fontSize: 13 }}>
        Direct administrator gateway for question banking, bulk importing, and module management.
      </p>

      {isIrfan && (
        <Card t={t} className="flex flex-col gap-2 text-left" style={{ borderColor: t.gold }}>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: t.gold }}>
            <Sparkles size={14} /> Signed in as Master Admin (Irfan@admin)
          </div>
          <p style={{ fontSize: 12, color: t.textMuted }}>
            Your account has full staff privileges and unlimited access.
          </p>
          <Btn t={t} full onClick={() => { enterAdmin(); navigate("/admin"); }}>
            Open Admin Dashboard
          </Btn>
        </Card>
      )}

      <Card t={t} className="flex flex-col gap-3 text-left">
        <label className="text-xs font-bold" style={{ color: t.textFaint }}>
          Admin Gate Password
        </label>
        <div className="relative">
          <input
            placeholder="admin123"
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

      <div className="flex flex-col gap-2 rounded-2xl p-4 text-left" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: t.purple }}>
          <Sparkles size={14} /> Quick Master Login
        </div>
        <p style={{ color: t.textMuted, fontSize: 12 }}>
          Log in directly as <strong style={{ color: t.text, fontFamily: FONT_MONO }}>Irfan@admin</strong> with full admin permissions and paywall bypass:
        </p>
        <button
          onClick={handleMasterLogin}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-transform active:scale-95"
          style={{ backgroundColor: `${t.purple}24`, color: isDark ? "#fff" : t.purpleStrong, border: `1px solid ${t.purple}44` }}
        >
          <ShieldCheck size={14} /> Log in as Irfan (Master Admin)
        </button>
      </div>

      <button onClick={() => navigate("/")} className="text-xs" style={{ color: t.textFaint }}>
        Back to student site
      </button>
    </div>
  );
}
