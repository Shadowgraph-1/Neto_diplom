import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice';

function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ username, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
      if (onClose) onClose();
    }
  };

  return (
    <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#2a2a2a] p-10 rounded-xl">
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none transition-colors"
      >
        &times;
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Вход</h2>
        <p className="text-gray-400 text-xs uppercase tracking-widest">Войдите в свой аккаунт</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
          {typeof error === 'string' ? error : 'Произошла ошибка при входе. Проверьте данные.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
            Логин
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Введите ваш логин"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Введите ваш пароль"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest text-sm hover:bg-[#f4d03f] disabled:bg-[#3a3a3a] disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

export default LoginModal;
