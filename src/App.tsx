import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shell from "./components/Shell";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import PracticeSetup from "./pages/PracticeSetup";
import Practice from "./pages/Practice";
import Results from "./pages/Results";
import Builder from "./pages/Builder";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";
import AdminGate from "./pages/AdminGate";
import AdminPanel from "./pages/AdminPanel";
import Paywall from "./pages/Paywall";
import NotFound from "./pages/NotFound";
import { subscribeAuth } from "./services/auth";
import { subscribeUserProfile } from "./services/firestore";
import { useAppStore } from "./store/useAppStore";
import { initAnalytics } from "./firebase";

export default function App() {
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const setProfile = useAppStore((s) => s.setProfile);
  const setAuthReady = useAppStore((s) => s.setAuthReady);
  const uid = useAppStore((s) => s.uid);

  useEffect(() => {
    initAnalytics();
  }, []);

  // Keep the store in sync with Firebase Auth for the lifetime of the app.
  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      if (user) {
        setAuthUser(user.uid, user.email, user.displayName ?? "");
      } else {
        setAuthUser(null, null, "");
        setProfile(null);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [setAuthUser, setProfile, setAuthReady]);

  // Once signed in, keep the Firestore profile (streak, daily goal, premium status) live.
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeUserProfile(uid, setProfile);
    return unsub;
  }, [uid, setProfile]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Student-facing site, wrapped in the shared shell (top bar + nav) */}
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
          <Route path="/subjects/:subjectId/:moduleId/:block" element={<PracticeSetup />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/results" element={<Results />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/paywall" element={<Paywall />} />
        </Route>

        {/* Admin — deliberately outside the student shell and not linked from the homepage */}
        <Route element={<AdminLayout />}>
          <Route path="/admin-gate" element={<AdminGate />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
