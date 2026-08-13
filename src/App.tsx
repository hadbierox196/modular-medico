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
import NotFound from "./pages/NotFound";

export default function App() {
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
          <Route path="/subjects/:subjectId/:moduleId/:setId" element={<PracticeSetup />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/results" element={<Results />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />
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
