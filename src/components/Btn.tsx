import type { ReactNode, CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { FONT_BODY, type ThemeTokens } from "../theme";

interface Props {
  children: ReactNode;
  t: ThemeTokens;
  onClick?: () => void;
  icon?: LucideIcon;
  /** Spins the icon (e.g. pass icon={Loader2} spin while an async action is in flight). */
  spin?: boolean;
  full?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: CSSProperties;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Btn({ children, t, onClick, icon: Icon, spin, full, variant = "primary", style, type = "button", disabled }: Props) {
  const styles: Record<string, CSSProperties> = {
    primary: { backgroundColor: t.gold, color: "#241A08", border: `1.5px solid ${t.gold}` },
    secondary: { backgroundColor: t.purpleStrong, color: "#fff", border: `1.5px solid ${t.purpleStrong}` },
    ghost: { backgroundColor: "transparent", color: t.text, border: `1.5px solid ${t.border}` },
    danger: { backgroundColor: "transparent", color: t.red, border: `1.5px solid ${t.red}55` },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-transform active:scale-[0.97] disabled:opacity-40 ${full ? "w-full" : ""}`}
      style={{ fontFamily: FONT_BODY, ...styles[variant], ...style }}
    >
      {children}
      {Icon && <Icon size={16} className={spin ? "animate-spin" : undefined} />}
    </button>
  );
}

