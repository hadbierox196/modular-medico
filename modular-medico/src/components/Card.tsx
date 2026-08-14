import type { ReactNode, CSSProperties } from "react";
import type { ThemeTokens } from "../theme";

interface Props {
  children: ReactNode;
  t: ThemeTokens;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}

export default function Card({ children, t, onClick, style, className = "" }: Props) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[22px] p-5 transition-transform ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${className}`}
      style={{
        backgroundColor: t.surface,
        border: `1.5px solid ${t.border}`,
        boxShadow: "0 10px 28px -16px rgba(20,10,40,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
