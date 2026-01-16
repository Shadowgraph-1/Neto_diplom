import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import Navigation from '../../components/Navigation/Navigation';

function Register() {
    const navigate = useNavigate();
    
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(''); // для отображения ошибок
    const [loading, setLoading] = useState(false); // для состояния загрузки
    const [loginError, setLoginError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [fullNameError, setFullNameError] = useState('');

    const validateLogin = (value) => {
        const regex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
        if (!regex.test(value)) {
            return "Логин должен начинаться с буквы, содержать только буквы и цифры, длина 4-20 символов.";
        }
        return "";
    };

    const validateEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            return "Неверный формат email.";
        }
        return "";
    };

    const validatePassword = (value) => {
        if (value.length < 6) {
            return "Пароль должен быть не менее 6 символов.";
        }
        if (!/[A-Z]/.test(value)) {
            return "Пароль должен содержать хотя бы одну заглавную букву.";
        }
        if (!/\d/.test(value)) {
            return "Пароль должен содержать хотя бы одну цифру.";
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            return "Пароль должен содержать хотя бы один специальный символ.";
        }
        return "";
    };

    const validateFullName = (value) => {
        if (value.trim().length < 2) {
            return "Полное имя должно содержать хотя бы 2 символа.";
        }
        return "";
    };

    const handleChange = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const loginErr = validateLogin(login);
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        const fullNameErr = validateFullName(fullName);
        
        setLoginError(loginErr);
        setEmailError(emailErr);
        setPasswordError(passwordErr);
        setFullNameError(fullNameErr);
        
        if (loginErr || emailErr || passwordErr || fullNameErr) {
            setLoading(false);
            return;
        }
        
        try {
            const data = await api.register(login, email, password, fullName);
            
            // Если сервер вернул токен или ID — всё хорошо
            if (data.token || data.id || data.message) {
                alert('Регистрация успешна!');
                navigate('/');
            } else {
                // Если пришел список ошибок (например: { username: ["Занято"] })
                // Мы берем первую ошибку из списка и показываем её
                const firstErrorKey = Object.keys(data)[0]; // получаем имя поля (например, "password")
                const errorMessage = data[firstErrorKey];   // получаем текст ошибки
                
                // Если ошибка — это массив (список), превращаем в строку
                if (Array.isArray(errorMessage)) {
                    setError(`${firstErrorKey}: ${errorMessage.join(', ')}`);
                } else {
                    // Если просто строка
                    setError(String(errorMessage));
                }
            }
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            setError('Ошибка сети или сервера.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <Navigation />
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Зарегистрируйтесь в сервисе My Cloud
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    Создайте аккаунт для безопасного хранения файлов и доступа к ним с любого устройства.
                </p>

                {/* Показываем ошибки */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleChange} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Почта
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Введите вашу почту"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                        />
                        <p className="text-red-500 text-sm">{emailError}</p>
                    </div>

                    <div>
                        <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                            Логин
                        </label>
                        <input
                            type="text"
                            id="login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                            placeholder="Введите ваш логин"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                        />
                        <p className="text-red-500 text-sm">{loginError}</p>
                    </div>

                    {/* НОВОЕ ПОЛЕ */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                            Полное имя
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Введите ваше полное имя"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                        />
                        <p className="text-red-500 text-sm">{fullNameError}</p>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Введите ваш пароль"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                        />
                        <p className="text-red-500 text-sm">{passwordError}</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register;