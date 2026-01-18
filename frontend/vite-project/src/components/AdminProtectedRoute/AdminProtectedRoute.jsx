import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

function AdminProtectedRoute({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем аутентификацию и права администратора
        api.getCurrentUser()
            .then((user) => {
                setIsAuthenticated(true);
                setIsAdmin(user.is_admin || false);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setIsAdmin(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminProtectedRoute;
