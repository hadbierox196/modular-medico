import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore } from "../store/useAppStore";

export default function AdminGate() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const enterAdmin = useAppStore((s) => s.enterAdmin);
  const t = isDark ? THEME.dark : THEME.light;
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (pw === "admin") {
      enterAdmin();
      navigate("/admin");
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-10 text-center">
      <ShieldCheck size={30} color={t.purple} className="mx-auto" />
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22 }}>Staff access</h1>
      <p style={{ color: t.textMuted, fontSize: 13 }}>
        This screen is just a UI gate (default password: <span style={{ fontFamily: FONT_MONO }}>admin</span>). The real permission
        check happens in Firestore: writes are only accepted from a signed-in account with the <span style={{ fontFamily: FONT_MONO }}>admin</span> custom
        claim (see <span style={{ fontFamily: FONT_MONO }}>scripts/setAdminClaim.mjs</span>). Log in with your account first.
      </p>
      <Card t={t} className="flex flex-col gap-3 text-left">
        <input
          placeholder="Admin password"
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="rounded-xl px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}`, color: t.text }}
        />
        {error && <span style={{ color: t.red, fontSize: 12 }}>{error}</span>}
        <Btn t={t} full onClick={submit}>
          Enter admin panel
        </Btn>
      </Card>
      <button onClick={() => navigate("/")} className="text-xs" style={{ color: t.textFaint }}>
        Back to student site
      </button>
    </div>
  );
}
