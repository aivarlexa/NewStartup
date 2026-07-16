import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getDashboardPath, getLoginPath } from '../context/authRoutes';

function ProtectedRoutes({ role = 'Developer' }) {
  const { token, user, loading } = useContext(AuthContext); // 1. Pull loading state from context
  const location = useLocation();

  // 2. Render a neutral loading screen while memory auth is resolving
  if (loading) {
    return (
      <div className="dashboard-loading-shell">
        <div className="spinner"></div>
        <p>Verifying secure workspace session...</p>
      </div>
    );
  }

  // 3. Once loading is false, safely evaluate the token presence
  if (!token) {
    return <Navigate to={getLoginPath(role)} replace state={{ from: location }} />;
  }

  // 4. Authorize role constraints cleanly
  if (user?.role !== role) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;