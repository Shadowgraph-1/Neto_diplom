import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/authSlice';
import Navigation from '../../components/Navigation/Navigation';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');

  const validateLogin = value => {
    const regex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
    if (!regex.test(value)) {
      return 'Логин должен начинаться с буквы, содержать только буквы и цифры, длина 4-20 символов.';
    }
    return '';
  };

  const validateEmail = value => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      return 'Неверный формат email.';
    }
    return '';
  };

  const validatePassword = value => {
    if (value.length < 6) {
      return 'Пароль должен быть не менее 6 символов.';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Пароль должен содержать хотя бы одну заглавную букву.';
    }
    if (!/\d/.test(value)) {
      return 'Пароль должен содержать хотя бы одну цифру.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      return 'Пароль должен содержать хотя бы один специальный символ.';
    }
    return '';
  };

  const validateFullName = value => {
    if (value.trim().length < 2) {
      return 'Полное имя должно содержать хотя бы 2 символа.';
    }
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(clearError());

    const loginErr = validateLogin(login);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const fullNameErr = validateFullName(fullName);

    setLoginError(loginErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setFullNameError(fullNameErr);

    if (loginErr || emailErr || passwordErr || fullNameErr) return;

    const result = await dispatch(registerUser({
      username: login,
      email,
      password,
      fullName,
    }));

    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    } else if (result.payload?.validationErrors) {
      const v = result.payload.validationErrors;
      if (v.username) setLoginError(Array.isArray(v.username) ? v.username[0] : v.username);
      if (v.email) setEmailError(Array.isArray(v.email) ? v.email[0] : v.email);
      if (v.password) setPasswordError(Array.isArray(v.password) ? v.password[0] : v.password);
      if (v.full_name) setFullNameError(Array.isArray(v.full_name) ? v.full_name[0] : v.full_name);
    }
  };

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
            {typeof error === 'string' ? error : 'Ошибка сети или сервера.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                            Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => {
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
              onChange={e => {
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
              onChange={e => {
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
              onChange={e => {
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
