import { useNavigate } from 'react-router-dom';

function Navigation() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('is_admin');
        navigate('/');
    };

    if (!token) {
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