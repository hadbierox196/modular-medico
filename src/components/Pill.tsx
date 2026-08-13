import type { ReactNode, CSSProperties } from "react";
import { FONT_BODY, type ThemeTokens } from "../theme";

interface Props {
  children: ReactNode;
  tone?: "purple" | "teal" | "gold" | "red" | "green" | "muted" | string;
  t: ThemeTokens;
  active?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  rotate?: number;
}

export default function Pill({ children, tone = "purple", t, active = false, style, onClick, rotate }: Props) {
  const toneMap: Record<string, string> = {
    purple: t.purple,
    teal: t.teal,
    gold: t.gold,
    red: t.red,
    green: t.green,
    muted: t.textFaint,
  };
  const toneColor = toneMap[tone] || tone;
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold"
      style={{
        fontFamily: FONT_BODY,
        color: active ? "#191221" : toneColor,
        backgroundColor: active ? toneColor : `${toneColor}20`,
        border: `1.5px solid ${active ? toneColor : `${toneColor}45`}`,
        cursor: onClick ? "pointer" : "default",
        transform: rotate ? `rotate(${rotate}deg)` : "none",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
