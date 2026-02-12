import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navigation from '../../components/Navigation/Navigation';
import { fetchUsers, deleteUser, updateUserAdmin } from '../../store/usersSlice';

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: users, loading, error } = useSelector(state => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = async userId => {
    if (!window.confirm('Удалить пользователя? Это действие нельзя отменить.')) return;
    await dispatch(deleteUser(userId));
  };

  const handleToggleAdmin = async user => {
    await dispatch(updateUserAdmin({ userId: user.id, isAdmin: !user.is_admin }));
  };

  const formatSize = bytes => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-white text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#d4af37]" />
            <h1 className="text-5xl font-black text-white tracking-tight">Админ панель</h1>
          </div>
          <p className="text-gray-400 text-sm uppercase tracking-widest ml-4">Управление пользователями</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Всего пользователей</div>
            <div className="text-3xl font-black text-white">{users.length}</div>
          </div>
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Администраторы</div>
            <div className="text-3xl font-black text-[#d4af37]">{users.filter(u => u.is_admin).length}</div>
          </div>
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Всего файлов</div>
            <div className="text-3xl font-black text-white">{users.reduce((sum, u) => sum + (u.files_count || 0), 0)}</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Users list */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Пользователи</h2>
            <span className="text-gray-400 text-sm">{users.length} пользователь(ей)</span>
          </div>
                    
          {users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Пользователей нет</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div 
                  key={user.id} 
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 hover:border-[#3a3a3a] transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white text-lg">{user.username}</h3>
                        {user.is_admin && (
                          <span className="px-2 py-1 bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] text-xs font-bold uppercase tracking-widest rounded">
                                                        Админ
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {user.email} • {user.full_name}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Файлов: <span className="text-white font-semibold">{user.files_count || 0}</span></span>
                        <span>•</span>
                        <span>Размер: <span className="text-white font-semibold">{formatSize(user.total_size || 0)}</span></span>
                      </div>
                    </div>
                                        
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => navigate(`/dashboard?user_id=${user.id}`)} 
                        className="px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
                      >
                                                Файлы
                      </button>
                      <button 
                        onClick={() => handleToggleAdmin(user)} 
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                          user.is_admin 
                            ? 'bg-red-900/20 border border-red-500/50 text-red-400 hover:border-red-500 hover:bg-red-900/30' 
                            : 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/30'
                        }`}
                      >
                        {user.is_admin ? 'Снять админа' : 'Сделать админом'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="px-4 py-2 bg-[#1a1a1a] border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-widest hover:border-red-500 hover:bg-red-500/10 transition-all duration-300"
                      >
                                                Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
