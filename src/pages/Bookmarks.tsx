import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkX, User } from "lucide-react";
import Card from "../components/Card";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { subscribeBookmarks, removeBookmark } from "../services/firestore";
import { SUBJECT_META } from "../data/subjects";
import type { BookmarkRecord } from "../types";

export default function Bookmarks() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const uid = useAppStore((s) => s.uid);
  const t = isDark ? THEME.dark : THEME.light;
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeBookmarks(uid, setBookmarks);
  }, [uid]);

  if (!uid) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <User size={30} color={t.purple} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21 }}>Sign in to save questions</h1>
        <p style={{ color: t.textMuted, fontSize: 14 }}>Bookmarks sync to your account so they're there on any device.</p>
        <Btn t={t} onClick={() => navigate("/login")}>
          Log in
        </Btn>
      </div>
    );
  }

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
          {bookmarks.map((b) => (
            <Card key={b.id} t={t} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${t.purple}22` }}>
                <Bookmark size={16} color={t.purple} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{b.question.q}</p>
                <span style={{ fontSize: 12, color: t.textFaint }}>
                  {SUBJECT_META[b.subjectId as keyof typeof SUBJECT_META]?.label || b.subjectId} \u00b7 {b.moduleName} \u00b7 Block {b.block}
                </span>
              </div>
              <button onClick={() => removeBookmark(uid, b.id)} title="Remove">
                <BookmarkX size={17} color={t.textFaint} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
