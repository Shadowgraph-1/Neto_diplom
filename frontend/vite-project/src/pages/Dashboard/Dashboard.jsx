import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import Navigation from '../../components/Navigation/Navigation';

function Dashboard() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [editingFileId, setEditingFileId] = useState(null);
    const [newName, setNewName] = useState('');
    const [editingCommentFileId, setEditingCommentFileId] = useState(null);
    const [newComment, setNewComment] = useState('');

    // Загружаем список файлов при открытии страницы
    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('user_id');
            const data = userId ? await api.getFiles(userId) : await api.getFiles();
            setFiles(data);
        } catch (err) {
            console.error('Ошибка загрузки файлов:', err);
            setError('Не удалось загрузить файлы');
        } finally {
            setLoading(false);
        }
    };


    // Выход из системы
    const handleLogout = async () => {
        try {
            await api.logout();
            navigate('/');
        } catch (error) {
            console.error('Ошибка выхода:', error);
            navigate('/');
        }
    };

    // Загрузка файла
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Выберите файл!');
            return;
        }

        setUploading(true);
        try {
            await api.uploadFile(selectedFile, comment);
            alert('Файл успешно загружен!');
            setSelectedFile(null);
            setComment('');
            loadFiles(); // обновляем список
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            alert('Не удалось загрузить файл');
        } finally {
            setUploading(false);
        }
    };

    // Удаление файла
    const handleDelete = async (fileId) => {
        if (!window.confirm('Удалить файл?')) return;
        
        try {
            await api.deleteFile(fileId);
            alert('Файл удален');
            loadFiles();
        } catch (err) {
            alert('Ошибка удаления');
        }
    };

    // Переименование файла
    const handleRenameStart = (file) => {
        setEditingFileId(file.id);
        setNewName(file.original_name);
    };

    const handleRenameSave = async (fileId) => {
        try {
            await api.renameFile(fileId, newName);
            setEditingFileId(null);
            setNewName('');
            loadFiles();
        } catch (err) {
            alert('Ошибка переименования');
        }
    };

    const handleRenameCancel = () => {
        setEditingFileId(null);
        setNewName('');
    };

    // Изменение комментария
    const handleCommentEditStart = (file) => {
        setEditingCommentFileId(file.id);
        setNewComment(file.comment || '');
    };

    const handleCommentSave = async (fileId) => {
        try {
            await api.updateFileComment(fileId, newComment);
            setEditingCommentFileId(null);
            setNewComment('');
            loadFiles();
        } catch (err) {
            alert('Ошибка изменения комментария');
        }
    };

    const handleCommentCancel = () => {
        setEditingCommentFileId(null);
        setNewComment('');
    };

    // Копирование специальной ссылки
    const handleCopyLink = (file) => {
        const link = `${window.location.origin}/api/download/${file.special_link}/`;
        navigator.clipboard.writeText(link);
        alert('Специальная ссылка скопирована в буфер обмена');
    };

    // Форматирование размера файла
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
                {/* Шапка */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Cloud</h1>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Выйти
                    </button>
                </div>

                {/* Форма загрузки */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Загрузить файл</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Комментарий (необязательно)"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {uploading ? 'Загрузка...' : 'Загрузить'}
                        </button>
                    </form>
                </div>

                {/* Список файлов */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Мои файлы</h2>
                    
                    {files.length === 0 ? (
                        <p className="text-gray-500">Файлов пока нет</p>
                    ) : (
                        <div className="space-y-4">
                            {files.map((file) => (
                                <div 
                                    key={file.id} 
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{file.original_name}</h3>
                                        {editingCommentFileId === file.id ? (
                                            <div className="flex gap-2 items-center mt-2">
                                                <input 
                                                    value={newComment} 
                                                    onChange={(e) => setNewComment(e.target.value)} 
                                                    placeholder="Комментарий"
                                                    className="px-2 py-1 border rounded flex-1"
                                                />
                                                <button 
                                                    onClick={() => handleCommentSave(file.id)} 
                                                    className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                                                >
                                                    Сохранить
                                                </button>
                                                <button 
                                                    onClick={handleCommentCancel} 
                                                    className="px-2 py-1 bg-gray-600 text-white rounded text-sm"
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                {formatSize(file.size)} • {file.comment || 'Без комментария'}
                                                <button 
                                                    onClick={() => handleCommentEditStart(file)}
                                                    className="ml-2 text-blue-600 hover:underline text-xs"
                                                >
                                                    Изменить
                                                </button>
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            Загружен: {new Date(file.upload_date).toLocaleDateString()}
                                            {file.last_download_date && ` • Последнее скачивание: ${new Date(file.last_download_date).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {editingFileId === file.id ? (
                                            <>
                                                <input 
                                                    value={newName} 
                                                    onChange={(e) => setNewName(e.target.value)} 
                                                    className="px-2 py-1 border rounded"
                                                />
                                                <button 
                                                    onClick={() => handleRenameSave(file.id)} 
                                                    className="px-2 py-1 bg-green-600 text-white rounded"
                                                >
                                                    Сохранить
                                                </button>
                                                <button 
                                                    onClick={handleRenameCancel} 
                                                    className="px-2 py-1 bg-gray-600 text-white rounded"
                                                >
                                                    Отмена
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => api.downloadFile(file.id, file.original_name)} 
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    Скачать
                                                </button>
                                                <button 
                                                    onClick={() => api.viewFile(file.id)} 
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                                >
                                                    Просмотр
                                                </button>
                                                <button 
                                                    onClick={() => handleRenameStart(file)} 
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Переименовать
                                                </button>
                                                <button 
                                                    onClick={() => handleCopyLink(file)} 
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                                >
                                                    Копировать ссылку
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(file.id)} 
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Удалить
                                                </button>
                                            </>
                                        )}
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

export default Dashboard;