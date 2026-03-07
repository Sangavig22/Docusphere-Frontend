import "./App.css";
import AppRoutes from "./routes/index.jsx";
import { DocumentsProvider } from "./hooks/useDocumentsStore.jsx";

function App() {
  return (
    <DocumentsProvider>
      <AppRoutes />
    </DocumentsProvider>
  );
}

export default App;

