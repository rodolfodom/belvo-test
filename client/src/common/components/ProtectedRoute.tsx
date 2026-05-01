import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const ProtectedRoute = () => {
    const { name } = useAuth();

    if (!name) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
