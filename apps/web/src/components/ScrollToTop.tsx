import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Gulir ke atas setiap kali pindah rute (BrowserRouter tak melakukannya otomatis). */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}
