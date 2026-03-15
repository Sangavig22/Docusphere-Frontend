import "./App.css";
import AppRoutes from "./routes";
import { DocumentsProvider } from "./hooks/DocumentsProvider";

function App() {
  return (
    <DocumentsProvider>
      <AppRoutes />
    </DocumentsProvider>
  );
}

export default App;

