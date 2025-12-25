import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import { useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // optional role required to access the route (e.g. 'superadmin')
  requiredRole?: 'administrator' | 'superadmin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const location = useLocation();
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    const u = getCurrentUser();
    setUserRole(u ? u.role : null);
    setChecking(false);
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="bg-slate-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // If user isn't the required role, require login as the correct user (preserve next)
    return <Navigate to={`/admin-login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;




