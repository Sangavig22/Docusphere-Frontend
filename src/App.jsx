import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import OcrSummarizationPage from "./pages/ocr/OcrSummarizationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ocr" element={<OcrSummarizationPage />} />
        <Route path="*" element={<Navigate to="/ocr" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
