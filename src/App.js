import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './contexts/auth';
import Routes from './routes';

import { ToastContainer } from 'react-toastify';

// depois de criado as pages SignIn e SignUp, instalar o react-router-dom:
// npm install react-router-dom

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer autoClose={3000} />
        <Routes/>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
