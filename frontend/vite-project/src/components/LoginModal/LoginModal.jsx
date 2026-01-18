import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function LoginModal({ onClose }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState(''); // изменено с email на username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login(username, password);
            
            if (data.user) {
                // Успешный вход (сессия создана автоматически)
                alert('Вход выполнен успешно!');
                navigate('/dashboard'); // перенаправляем на страницу с файлами
                if (onClose) onClose();
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            console.error('Ошибка входа:', err);
            setError('Произошла ошибка при входе. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 p-10 shadow-2xl rounded-xl">
            <button 
                type="button" 
                onClick={onClose} 
                aria-label="Закрыть" 
                className="absolute top-3 right-3 text-zinc-300 hover:text-white text-2xl leading-none"
            >
                &times;
            </button>
            
            <h2 className="text-sm font-black text-center text-white mb-12 uppercase tracking-[0.5em]">
                Вход в систему
            </h2>

            {/* Показываем ошибки */}
            {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="relative group">
                    <label htmlFor="username" className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3 group-focus-within:text-white transition-colors">
                        Логин {/* изменено с "Почта" на "Логин" */}
                    </label>
                    <input 
                        type="text" /* изменено с email на text */
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Введите ваш логин"
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all duration-500" 
                    />
                </div>

                <div className="relative group">
                    <label htmlFor="password" className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3 group-focus-within:text-white transition-colors">
                        Пароль
                    </label>
                    <input 
                        type="password" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Введите ваш пароль"
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all duration-500"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-200 transition-all duration-300 active:scale-95 disabled:bg-gray-400"
                >
                    {loading ? 'Вход...' : 'Подтвердить'}
                </button>
            </form>
        </div>
    );
}

export default LoginModal;