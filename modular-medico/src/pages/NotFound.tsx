import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore } from "../store/useAppStore";

export default function NotFound() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const t = isDark ? THEME.dark : THEME.light;
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-20 text-center">
      <Compass size={30} color={t.purple} />
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22 }}>Page not found</h1>
      <p style={{ color: t.textMuted, fontSize: 14 }}>That page doesn't exist, or the set you were looking for moved.</p>
      <Btn t={t} onClick={() => navigate("/")}>
        Back home
      </Btn>
    </div>
  );
}
