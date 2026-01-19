// Конфигурация API
// Для подключения к вашему бэкенду на сервере используйте:
// VITE_API_URL=http://130.49.148.127:8000/api
// Или локально для разработки: VITE_API_URL=http://127.0.0.1:8000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://130.49.148.127:8000/api';

// Получить токен из localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Сохранить токен в localStorage
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

// Удалить токен из localStorage
function removeAuthToken() {
  localStorage.removeItem('authToken');
}

// Вспомогательная функция для выполнения запросов с токен-аутентификацией
async function apiRequest(url, options = {}) {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Для FormData не устанавливаем Content-Type
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_URL}${url}`, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        if (window.location.pathname !== '/' && window.location.pathname !== '/registration') {
          window.location.href = '/';
        }
      }
      
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({ error: 'Доступ запрещен' }));
        throw new Error(errorData.error || 'Недостаточно прав для выполнения операции');
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Произошла ошибка' }));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (options.method === 'DELETE' && response.status === 204) {
      return true;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Регистрация - возвращает токен
  register: async (username, email, password, full_name) => {
    const data = await apiRequest('/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Вход - получает и сохраняет токен
  login: async (username, password) => {
    const data = await apiRequest('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Выход
  logout: async () => {
    try {
      await apiRequest('/logout/', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  // Получить текущего пользователя
  getCurrentUser: async () => {
    return apiRequest('/current-user/');
  },

  // Получить список файлов
  getFiles: async (userId = null) => {
    const url = userId ? `/files/?user_id=${userId}` : '/files/';
    return apiRequest(url);
  },

  // Загрузить файл
  uploadFile: async (file, comment) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);
    
    const token = getAuthToken();
    
    // Для FormData используем отдельный запрос с токеном
    const response = await fetch(`${API_URL}/files/`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { 'Authorization': `Token ${token}` }),
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        if (window.location.pathname !== '/' && window.location.pathname !== '/registration') {
          window.location.href = '/';
        }
      }
      const errorData = await response.json().catch(() => ({ error: 'Произошла ошибка' }));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  },

  // Удалить файл
  deleteFile: async (fileId) => {
    return apiRequest(`/files/${fileId}/`, {
      method: 'DELETE',
    });
  },

  // Переименовать файл
  renameFile: async (fileId, newName) => {
    return apiRequest(`/files/${fileId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ original_name: newName }),
    });
  },

  // Скачать файл
  downloadFile: async (fileId, fileName) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
      headers: { ...(token && { 'Authorization': `Token ${token}` }) },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'file';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error('Не удалось скачать файл');
    }
  },

  // Получить список пользователей (только для админов)
  getUsers: async () => {
    return apiRequest('/users/');
  },

  // Удалить пользователя
  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}/`, {
      method: 'DELETE',
    });
  },

  // Обновить пользователя (изменение прав администратора)
  updateUser: async (userId, isAdmin) => {
    return apiRequest(`/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_admin: isAdmin }),
    });
  },

  // Изменение комментария к файлу
  updateFileComment: async (fileId, comment) => {
    return apiRequest(`/files/${fileId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment }),
    });
  },

  // Просмотр файла в браузере
  viewFile: async (fileId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/files/${fileId}/view/`, {
      headers: { ...(token && { 'Authorization': `Token ${token}` }) },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      throw new Error('Не удалось открыть файл');
    }
  },
};
