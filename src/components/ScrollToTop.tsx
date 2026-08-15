import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position to the top of the page whenever the route (path or
 * search query) changes. Without this, React Router preserves the browser's
 * default scroll position, so navigating from the bottom of a long page
 * (e.g. Subjects list) into a new screen would render it already scrolled
 * down instead of starting at the top.
 *
 * Mounted once near the root, inside <BrowserRouter>, so it applies to every
 * screen — both the student Shell and the Admin layout.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    // Plain scrollTo (no smooth behavior) avoids a visible animation on every navigation.
    window.scrollTo(0, 0);
  }, [pathname, search]);

  // Safety net for cases where content (e.g. async data) finishes rendering
  // and grows the page just after the layout effect above already ran.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
