import type { ThemeTokens } from "../theme";

interface Props {
  t: ThemeTokens;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Toggle({ t, checked, onChange }: Props) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: checked ? t.teal : t.border }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all"
        style={{ left: checked ? 22 : 2, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
      />
    </button>
  );
}
