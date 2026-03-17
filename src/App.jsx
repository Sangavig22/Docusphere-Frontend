import './App.css'
import AppRoutes from "./routes"
import { DocumentsProvider } from "./hooks/useDocumentsStore";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
   return (
    <DocumentsProvider>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={true} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      <AppRoutes />
    </DocumentsProvider>
  );
}

export default App
