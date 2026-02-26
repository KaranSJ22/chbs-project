import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ requiredRole, allowedRoles }) => {
    const { user, loading, isAuthenticated, logout } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-700 border-t-transparent"></div>
                    <p className="text-sm font-medium text-gray-500">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Check role requirements
    const roleFails =
        (requiredRole && user.role !== requiredRole) ||
        (allowedRoles && !allowedRoles.includes(user.role));

    if (roleFails) {
        //clear the cache before redirecting to avoid infinite bounce in login page
        logout();
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
