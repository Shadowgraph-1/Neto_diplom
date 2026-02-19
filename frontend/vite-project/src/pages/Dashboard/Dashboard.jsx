import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, getDownloadLink } from '../../services/api';
import Navigation from '../../components/Navigation/Navigation';
import {
  fetchFiles,
  uploadFile,
  deleteFile,
  renameFile,
  updateFileComment,
  clearFilesError,
  setFilesError,
} from '../../store/filesSlice';

function Dashboard() {
  const dispatch = useDispatch();
  const { items: files, loading, uploading, error } = useSelector(state => state.files);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingCommentFileId, setEditingCommentFileId] = useState(null);
  const [newComment, setNewComment] = useState('');

  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get('user_id');
    dispatch(fetchFiles(userId || undefined));
  }, [dispatch, location.search]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!selectedFile) {
      dispatch(setFilesError('Выберите файл для загрузки'));
      return;
    }
    dispatch(clearFilesError());
    const result = await dispatch(uploadFile({ file: selectedFile, comment }));
    if (uploadFile.fulfilled.match(result)) {
      setSelectedFile(null);
      setComment('');
    }
  };

  const handleDelete = async fileId => {
    if (!window.confirm('Удалить файл? Это действие нельзя отменить.')) return;
    await dispatch(deleteFile(fileId));
  };

  const handleRenameStart = file => {
    setEditingFileId(file.id);
    setNewName(file.original_name);
  };

  const handleRenameSave = async fileId => {
    const result = await dispatch(renameFile({ fileId, newName }));
    if (renameFile.fulfilled.match(result)) {
      setEditingFileId(null);
      setNewName('');
    }
  };

  const handleRenameCancel = () => {
    setEditingFileId(null);
    setNewName('');
  };

  const handleCommentEditStart = file => {
    setEditingCommentFileId(file.id);
    setNewComment(file.comment || '');
  };

  const handleCommentSave = async fileId => {
    const result = await dispatch(updateFileComment({ fileId, comment: newComment }));
    if (updateFileComment.fulfilled.match(result)) {
      setEditingCommentFileId(null);
      setNewComment('');
    }
  };

  const handleCommentCancel = () => {
    setEditingCommentFileId(null);
    setNewComment('');
  };

  const handleCopyLink = file => {
    const link = getDownloadLink(file.special_link);
    navigator.clipboard.writeText(link);
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-6 bg-[#d4af37] text-black px-6 py-3 rounded-lg shadow-xl z-50 text-sm font-bold';
    notification.textContent = 'Ссылка скопирована!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
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
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Мои файлы</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Управление хранилищем</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload form */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Загрузить файл</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <input
                type="file"
                onChange={e => setSelectedFile(e.target.files[0])}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-black hover:file:bg-[#f4d03f] cursor-pointer"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-400">Выбран: {selectedFile.name}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Комментарий (необязательно)"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-8 py-3 bg-[#d4af37] text-black font-bold uppercase tracking-widest text-sm hover:bg-[#f4d03f] disabled:bg-[#3a3a3a] disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
            >
              {uploading ? 'Загрузка...' : 'Загрузить файл'}
            </button>
          </form>
        </div>

        {/* Files list */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Список файлов</h2>
            <span className="text-gray-400 text-sm">{files.length} файл(ов)</span>
          </div>
                    
          {files.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">Файлов пока нет</p>
              <p className="text-gray-600 text-sm">Загрузите свой первый файл выше</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 hover:border-[#3a3a3a] transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {editingFileId === file.id ? (
                        <div className="flex gap-2 items-center mb-3">
                          <input 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)} 
                            className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3a] rounded text-white text-sm focus:outline-none focus:border-[#d4af37]"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleRenameSave(file.id)} 
                            className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#f4d03f] transition-colors"
                          >
                                                        ✓
                          </button>
                          <button 
                            onClick={handleRenameCancel} 
                            className="px-4 py-2 bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#4a4a4a] transition-colors"
                          >
                                                        ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-bold text-white mb-2 text-lg truncate">{file.original_name}</h3>
                      )}
                                            
                      {editingCommentFileId === file.id ? (
                        <div className="flex gap-2 items-center mb-3">
                          <input 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)} 
                            placeholder="Комментарий"
                            className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#3a3a3a] rounded text-white text-sm focus:outline-none focus:border-[#d4af37]"
                          />
                          <button 
                            onClick={() => handleCommentSave(file.id)} 
                            className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#f4d03f] transition-colors"
                          >
                                                        ✓
                          </button>
                          <button 
                            onClick={handleCommentCancel} 
                            className="px-4 py-2 bg-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#4a4a4a] transition-colors"
                          >
                                                        ✕
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-2">
                          {file.comment || <span className="italic text-gray-600">Без комментария</span>}
                          <button 
                            onClick={() => handleCommentEditStart(file)}
                            className="ml-3 text-[#d4af37] hover:text-[#f4d03f] text-xs uppercase tracking-wider transition-colors"
                          >
                                                        Изменить
                          </button>
                        </p>
                      )}
                                            
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>Загружен: {new Date(file.upload_date).toLocaleDateString('ru-RU')}</span>
                        {file.last_download_date && (
                          <>
                            <span>•</span>
                            <span>Скачан: {new Date(file.last_download_date).toLocaleDateString('ru-RU')}</span>
                          </>
                        )}
                      </div>
                    </div>
                                        
                    <div className="flex gap-2 flex-wrap">
                      {editingFileId === file.id ? null : (
                        <>
                          <button 
                            onClick={() => api.downloadFile(file.id, file.original_name)} 
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
                          >
                                                        Скачать
                          </button>
                          <button 
                            onClick={() => api.viewFile(file.id)} 
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
                          >
                                                        Просмотр
                          </button>
                          <button 
                            onClick={() => handleRenameStart(file)} 
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
                          >
                                                        Переименовать
                          </button>
                          <button 
                            onClick={() => handleCopyLink(file)} 
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-white text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
                          >
                                                        Ссылка
                          </button>
                          <button 
                            onClick={() => handleDelete(file.id)} 
                            className="px-4 py-2 bg-[#1a1a1a] border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-widest hover:border-red-500 hover:bg-red-500/10 transition-all duration-300"
                          >
                                                        Удалить
                          </button>
                        </>
                      )}
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

export default Dashboard;
