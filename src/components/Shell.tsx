import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  BookOpen,
  Bookmark,
  User,
  Moon,
  Sun,
  Menu,
  X,
  Flame,
  Wand2,
  Search,
  LogOut,
} from "lucide-react";
import Logomark from "./Logomark";
import { THEME, FONT_DISPLAY, FONT_BODY } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { logOut as firebaseLogOut } from "../services/auth";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/subjects", label: "Practice", icon: BookOpen },
  { to: "/builder", label: "Build", icon: Wand2, center: true },
  { to: "/bookmarks", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppStore((s) => s.isDark);
  const toggleDark = useAppStore((s) => s.toggleDark);
  const uid = useAppStore((s) => s.uid);
  const profile = useAppStore((s) => s.profile);
  const isLoggedIn = !!uid;

  const t = isDark ? THEME.dark : THEME.light;

  const isActive = (to: string, end?: boolean) => (end ? location.pathname === to : location.pathname.startsWith(to));

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: FONT_BODY, minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-7"
        style={{ backgroundColor: `${t.bg}E8`, backdropFilter: "blur(10px)", borderBottom: `1.5px solid ${t.border}` }}
      >
        <button className="flex items-center gap-2" onClick={() => navigate("/")}>
          <Logomark size={27} color={t.purple} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19 }}>
            Modular <span style={{ color: t.teal }}>Medico</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-full px-4 py-2 text-xs font-extrabold sm:inline-flex"
              style={{ backgroundColor: t.gold, color: "#241A08", fontFamily: FONT_BODY }}
            >
              Log in
            </button>
          ) : (
            <span className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex" style={{ backgroundColor: `${t.green}22`, color: t.green }}>
              <Flame size={12} /> {profile?.streak ?? 0}-day streak
            </span>
          )}
          <button
            onClick={() => navigate("/search")}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}
            aria-label="Search"
          >
            <Search size={16} color={t.textMuted} />
          </button>
          <button
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={16} color={t.gold} /> : <Moon size={16} color={t.purple} />}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            style={{ backgroundColor: t.surfaceAlt, border: `1.5px solid ${t.border}` }}
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-56 shrink-0 flex-col justify-between py-6 pl-4 pr-2 md:flex" style={{ borderRight: `1.5px solid ${t.border}` }}>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to, item.end);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-colors"
                  style={{ backgroundColor: active ? t.purpleDeep : "transparent", color: active ? (isDark ? "#fff" : t.purpleStrong) : t.textMuted }}
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="flex flex-col gap-2">
            {isLoggedIn ? (
              <button onClick={() => { firebaseLogOut(); navigate("/"); }} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold" style={{ color: t.textFaint }}>
                <LogOut size={15} /> Log out
              </button>
            ) : (
              <NavLink to="/login" className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold" style={{ color: t.textFaint }}>
                <User size={15} /> Log in
              </NavLink>
            )}
          </div>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,6,20,0.6)" }} />
            <div className="absolute right-0 top-0 h-full w-64 p-5" style={{ backgroundColor: t.surface, borderLeft: `1.5px solid ${t.border}` }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}>Menu</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold"
                    style={{ backgroundColor: isActive(item.to, item.end) ? t.purpleDeep : "transparent" }}
                  >
                    <item.icon size={17} /> {item.label}
                  </NavLink>
                ))}
                <div className="my-2 h-px" style={{ backgroundColor: t.border }} />
                {isLoggedIn ? (
                  <button onClick={() => { firebaseLogOut(); setMenuOpen(false); navigate("/"); }} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold" style={{ color: t.textFaint }}>
                    <LogOut size={16} /> Log out
                  </button>
                ) : (
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold" style={{ color: t.textFaint }}>
                    <User size={16} /> Log in
                  </NavLink>
                )}
              </nav>
            </div>
          </div>
        )}

        <main className="w-full flex-1 px-4 pt-4 pb-36 sm:pb-40 md:px-8 md:pt-6 md:pb-16 min-h-[calc(100vh-61px)] overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around py-2 px-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden backdrop-blur-md" style={{ backgroundColor: `${t.surface}F0`, borderTop: `1.5px solid ${t.border}` }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to, item.end);
          if (item.center) {
            return (
              <button key={item.to} onClick={() => navigate(item.to)} className="flex flex-col items-center gap-1 px-2 active:scale-95 transition-transform">
                <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: t.gold, marginTop: -18, boxShadow: `0 6px 16px -4px ${t.gold}88` }}>
                  <item.icon size={19} color="#241A08" />
                </div>
                <span style={{ fontSize: 10, color: active ? t.text : t.textFaint, fontFamily: FONT_BODY, fontWeight: 700 }}>{item.label}</span>
              </button>
            );
          }
          return (
            <button key={item.to} onClick={() => navigate(item.to)} className="flex flex-col items-center gap-1 px-2 py-1 active:scale-95 transition-transform">
              <div className="flex h-9 w-9 items-center justify-center rounded-full transition-colors" style={{ backgroundColor: active ? t.purpleStrong : "transparent" }}>
                <item.icon size={17} color={active ? "#fff" : t.textMuted} />
              </div>
              <span style={{ fontSize: 10, color: active ? t.text : t.textFaint, fontFamily: FONT_BODY, fontWeight: 700 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
