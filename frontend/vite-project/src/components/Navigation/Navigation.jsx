import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, logoutUser } from '../../store/authSlice';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isAdmin, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch, location]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-white font-bold text-xl tracking-tight hover:text-[#d4af37] transition-colors"
          >
                        My Cloud
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/registration')} 
              className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all duration-300"
            >
                            Регистрация
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="px-6 py-2.5 bg-transparent text-white border-2 border-[#3a3a3a] text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
            >
                            Вход
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-white font-bold text-xl tracking-tight hover:text-[#d4af37] transition-colors"
          >
                        My Cloud
          </button>
          <div className="h-6 w-px bg-[#3a3a3a]" />
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                location.pathname === '/dashboard' 
                  ? 'bg-[#d4af37] text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
                            Файлы
            </button>
            <button 
              onClick={() => navigate('/admin')} 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                location.pathname === '/admin' 
                  ? 'bg-[#d4af37] text-black' 
                  : isAdmin 
                    ? 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]' 
                    : 'text-gray-600 cursor-not-allowed opacity-50'
              }`}
              disabled={!isAdmin}
              title={!isAdmin ? 'Требуются права администратора' : 'Админ панель'}
            >
                            Админ
            </button>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="px-6 py-2.5 bg-transparent text-gray-400 border-2 border-[#3a3a3a] text-xs font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all duration-300"
        >
                    Выход
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
