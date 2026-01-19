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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
            
            if (data.user || data.id || data.message) {
                navigate('/');
            } else {
                const firstErrorKey = Object.keys(data)[0];
                const errorMessage = data[firstErrorKey];
                
                if (Array.isArray(errorMessage)) {
                    setError(`${firstErrorKey}: ${errorMessage.join(', ')}`);
                } else {
                    setError(String(errorMessage));
                }
            }
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            setError(err.message || 'Ошибка сети или сервера.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
            <Navigation />
            <div className="w-full max-w-md bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Регистрация</h1>
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Создайте аккаунт в My Cloud</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleChange} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError('');
                            }}
                            required
                            placeholder="your@email.com"
                            className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors ${
                                emailError ? 'border-red-500' : 'border-[#3a3a3a]'
                            }`}
                        />
                        {emailError && <p className="mt-2 text-red-400 text-xs">{emailError}</p>}
                    </div>

                    <div>
                        <label htmlFor="login" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Логин
                        </label>
                        <input
                            type="text"
                            id="login"
                            value={login}
                            onChange={(e) => {
                                setLogin(e.target.value);
                                setLoginError('');
                            }}
                            required
                            placeholder="Ваш логин"
                            className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors ${
                                loginError ? 'border-red-500' : 'border-[#3a3a3a]'
                            }`}
                        />
                        {loginError && <p className="mt-2 text-red-400 text-xs">{loginError}</p>}
                    </div>

                    <div>
                        <label htmlFor="fullName" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Полное имя
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                setFullNameError('');
                            }}
                            required
                            placeholder="Ваше полное имя"
                            className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors ${
                                fullNameError ? 'border-red-500' : 'border-[#3a3a3a]'
                            }`}
                        />
                        {fullNameError && <p className="mt-2 text-red-400 text-xs">{fullNameError}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError('');
                            }}
                            required
                            placeholder="Минимум 6 символов"
                            className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors ${
                                passwordError ? 'border-red-500' : 'border-[#3a3a3a]'
                            }`}
                        />
                        {passwordError && <p className="mt-2 text-red-400 text-xs">{passwordError}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest text-sm hover:bg-[#f4d03f] disabled:bg-[#3a3a3a] disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {loading ? 'Регистрация...' : 'Создать аккаунт'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register;
