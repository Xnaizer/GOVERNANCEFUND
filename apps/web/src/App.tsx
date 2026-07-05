import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}