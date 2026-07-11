import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfflineBanner } from "./components/OfflineBanner";
import { ScrollToTop } from "./components/ScrollToTop";
import { RouteProgress } from "./components/RouteProgress";

export function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <BrowserRouter>
        <ScrollToTop />
        <RouteProgress />
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
