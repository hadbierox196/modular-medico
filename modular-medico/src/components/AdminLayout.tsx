import { Outlet } from "react-router-dom";
import { THEME, FONT_BODY } from "../theme";
import { useAppStore } from "../store/useAppStore";

export default function AdminLayout() {
  const isDark = useAppStore((s) => s.isDark);
  const t = isDark ? THEME.dark : THEME.light;
  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: FONT_BODY, minHeight: "100vh" }}>
      <div className="mx-auto max-w-5xl px-5 py-8">
        <Outlet />
      </div>
    </div>
  );
}
