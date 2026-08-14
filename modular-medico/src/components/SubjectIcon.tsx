import { FONT_DISPLAY } from "../theme";
import { SUBJECT_META } from "../data/subjects";

interface Props {
  id: string;
  size?: number;
  color: string;
}

export default function SubjectIcon({ id, size = 18, color }: Props) {
  const meta = (SUBJECT_META as Record<string, { label: string; tag: string }>)[id];
  const initials = (meta?.label || "?").slice(0, 2).toUpperCase();
  return <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color }}>{initials}</span>;
}
