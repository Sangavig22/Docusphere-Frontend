import "./App.css";
import AppRoutes from "./routes";
import { DocumentsProvider } from "./hooks/useDocumentsStore";

function App() {
  return (
    <DocumentsProvider>
      <AppRoutes />
    </DocumentsProvider>
  );
}

export default App;

