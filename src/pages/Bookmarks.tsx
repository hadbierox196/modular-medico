import { Bookmark, BookmarkX } from "lucide-react";
import Card from "../components/Card";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { SUBJECT_META } from "../data/mockData";

export default function Bookmarks() {
  const isDark = useAppStore((s) => s.isDark);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const removeBookmark = useAppStore((s) => s.removeBookmark);
  const t = isDark ? THEME.dark : THEME.light;

  return (
    <div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Saved questions</h1>
      <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 18 }}>
        Bookmarked mid-practice, kept separate from your wrong-answer spaced-repetition queue.
      </p>

      {bookmarks.length === 0 ? (
        <Card t={t} className="text-center">
          <Bookmark size={22} color={t.textFaint} className="mx-auto mb-2" />
          <p className="text-sm" style={{ color: t.textMuted }}>
            Nothing saved yet. Tap the bookmark icon during any practice question to keep it here.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarks.map((b, i) => (
            <Card key={i} t={t} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${t.purple}22` }}>
                <Bookmark size={16} color={t.purple} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{b.question.q}</p>
                <span style={{ fontSize: 12, color: t.textFaint }}>{SUBJECT_META[b.subjectId]?.label || b.subjectId}</span>
              </div>
              <button onClick={() => removeBookmark(b.question)} title="Remove">
                <BookmarkX size={17} color={t.textFaint} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
