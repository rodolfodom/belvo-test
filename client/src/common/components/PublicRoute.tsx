import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const PublicRoute = () => {
    const { name } = useAuth();

    if (name) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
