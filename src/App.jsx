import './App.css'
import AppRoutes from "./routes"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
   return (
    <ThemeProvider>
      <UserProvider>
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
      </UserProvider>
    </ThemeProvider>
  );
}

export default App
