import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем аутентификацию через API
        api.getCurrentUser()
            .then(() => {
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
