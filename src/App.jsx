import './App.css'
import AppRoutes from "./routes"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import SessionTimeoutWarning from './components/Authentication/SessionTimeoutWarning';

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
          style={{ zIndex: 100000 }}
        />
        <SessionTimeoutWarning />
        <AppRoutes />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App
