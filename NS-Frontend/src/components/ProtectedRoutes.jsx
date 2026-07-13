import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getDashboardPath, getLoginPath } from '../context/authRoutes';

function ProtectedRoutes({ role = 'Developer' }) {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    return <Navigate to={getLoginPath(role)} replace state={{ from: location }} />;
  }

  if (user?.role !== role) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
