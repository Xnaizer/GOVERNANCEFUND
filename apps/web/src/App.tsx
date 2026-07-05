import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { ExplorerPage } from "./pages/ExplorerPage";
import { ProgramDetailPage } from "./pages/ProgramDetailPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/programs" element={<ExplorerPage />} />
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </BrowserRouter>
  );
}