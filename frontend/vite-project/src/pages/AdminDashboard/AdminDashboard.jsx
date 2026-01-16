import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import Navigation from '../../components/Navigation/Navigation';

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
            setError('Не удалось загрузить пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Удалить пользователя?')) return;
        
        try {
            await api.deleteUser(userId);
            alert('Пользователь удален');
            loadUsers();
        } catch (err) {
            alert('Ошибка удаления');
        }
    };

    const handleToggleAdmin = async (user) => {
        try {
            await api.updateUser(user.id, !user.is_admin);
            loadUsers();
        } catch (err) {
            alert('Ошибка обновления');
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Navigation />
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Админ панель</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Пользователи</h2>
                    
                    {users.length === 0 ? (
                        <p className="text-gray-500">Пользователей нет</p>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div 
                                    key={user.id} 
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{user.username}</h3>
                                        <p className="text-sm text-gray-500">
                                            {user.email} • {user.full_name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Админ: {user.is_admin ? 'Да' : 'Нет'} • Файлов: {user.files_count || 0} • Размер: {formatSize(user.total_size || 0)}
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/dashboard?user_id=${user.id}`)} 
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Управление файлами
                                        </button>
                                        <button 
                                            onClick={() => handleToggleAdmin(user)} 
                                            className={`px-4 py-2 text-white rounded-lg ${user.is_admin ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                        >
                                            {user.is_admin ? 'Снять админа' : 'Сделать админом'}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)} 
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Удалить
                                        </button>
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