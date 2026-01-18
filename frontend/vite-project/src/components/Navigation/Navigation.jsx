import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

function Navigation() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем состояние аутентификации
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

    const handleLogout = async () => {
        try {
            await api.logout();
            setIsAuthenticated(false);
            setIsAdmin(false);
            navigate('/');
        } catch (error) {
            console.error('Ошибка выхода:', error);
            // Все равно перенаправляем, так как сессия может быть завершена на сервере
            setIsAuthenticated(false);
            setIsAdmin(false);
            navigate('/');
        }
    };

    if (loading) {
        return null; // Или можно показать загрузку
    }

    if (!isAuthenticated) {
        return (
            <nav className="absolute top-4 right-4 flex gap-4">
                <button 
                    onClick={() => navigate('/registration')} 
                    className="px-4 py-2 bg-white text-black text-sm font-medium uppercase tracking-wider hover:scale-105 transition"
                >
                    Регистрация
                </button>
                <button 
                    onClick={() => navigate('/')} 
                    className="px-4 py-2 bg-transparent text-white border border-white text-sm font-medium uppercase tracking-wider hover:bg-white hover:text-black transition"
                >
                    Вход
                </button>
            </nav>
        );
    }

    return (
        <nav className="absolute top-4 right-4 flex gap-4">
            {isAdmin && (
                <button 
                    onClick={() => navigate('/admin')} 
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium uppercase tracking-wider hover:scale-105 transition"
                >
                    Админ
                </button>
            )}
            <button 
                onClick={() => navigate('/dashboard')} 
                className="px-4 py-2 bg-white text-black text-sm font-medium uppercase tracking-wider hover:scale-105 transition"
            >
                Файлы
            </button>
            <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-transparent text-white border border-white text-sm font-medium uppercase tracking-wider hover:bg-white hover:text-black transition"
            >
                Выход
            </button>
        </nav>
    );
}

export default Navigation;
