import { Loader2 } from "lucide-react";
import type { ThemeTokens } from "../theme";

interface Props {
  t: ThemeTokens;
  size?: number;
  color?: string;
  label?: string;
  className?: string;
}

/** A circular spinning loading indicator, for use anywhere content is being fetched from the backend. */
export default function Spinner({ t, size = 20, color, label, className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 size={size} color={color || t.purple} className="animate-spin" />
      {label && (
        <span style={{ color: t.textMuted, fontSize: 13 }}>{label}</span>
      )}
    </div>
  );
}
