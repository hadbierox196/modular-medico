import { FONT_DISPLAY } from "../theme";
import { SUBJECT_META } from "../data/mockData";

interface Props {
  id: string;
  size?: number;
  color: string;
}

export default function SubjectIcon({ id, size = 18, color }: Props) {
  const initials = (SUBJECT_META[id]?.label || "?").slice(0, 2).toUpperCase();
  return <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color }}>{initials}</span>;
}
