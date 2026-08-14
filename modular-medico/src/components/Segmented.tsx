import type { LucideIcon } from "lucide-react";
import { FONT_BODY, type ThemeTokens } from "../theme";

interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface Props {
  t: ThemeTokens;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function Segmented({ t, options, value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-2xl p-1" style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors"
          style={{
            fontFamily: FONT_BODY,
            backgroundColor: value === opt.value ? t.purpleStrong : "transparent",
            color: value === opt.value ? "#fff" : t.textMuted,
          }}
        >
          {opt.icon && <opt.icon size={13} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
