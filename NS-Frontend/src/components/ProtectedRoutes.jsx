import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function ProtectedRoutes() {
  const { token } = useContext(AuthContext);

  return token ? <Outlet /> : <Navigate to="/developer-login" />;
}

export default ProtectedRoutes;