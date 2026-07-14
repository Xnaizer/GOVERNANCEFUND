import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { beginRouteLoad, useRouteLoading } from "../lib/routeProgress";

export function RouteProgress() {
  const { pathname } = useLocation();
  const loading = useRouteLoading();
  const first = useRef(true);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const release = beginRouteLoad();
    const t = setTimeout(release, 500);
    return () => {
      clearTimeout(t);
      release();
    };
  }, [pathname]);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setWidth(8);
      const id = setInterval(() => {
        setWidth((w) => (w >= 90 ? w : Math.min(90, w + (90 - w) * 0.12 + 1)));
      }, 180);
      return () => clearInterval(id);
    }
    
    setWidth((w) => (w > 0 ? 100 : 0));
    const t = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 320);
    return () => clearTimeout(t);
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.75">
      <div
        className="route-progress-bar h-full"
        style={{ width: `${width}%`, opacity: width >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
