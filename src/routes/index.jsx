import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { documentRoutes } from "./routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/uploads" replace />} />

        {documentRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}

        <Route path="*" element={<div className="p-6">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
