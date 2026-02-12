// Конфигурация API
// Для подключения к вашему бэкенду на сервере используйте:
// VITE_API_URL=http://130.49.148.127:8000/api
// Или локально для разработки: VITE_API_URL=http://127.0.0.1:8000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
// Для production: VITE_API_URL=http://your-server:8000/api

export function getDownloadLink(specialLink) {
  return `${API_URL}/download/${specialLink}/`;
}

let csrfTokenPromise = null;

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

async function ensureCsrfToken() {
  if (getCsrfToken()) return getCsrfToken();
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${API_URL}/csrf/`, { credentials: 'include' })
      .then(() => getCsrfToken());
  }
  return csrfTokenPromise;
}

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

async function apiRequest(url, options = {}) {
  const token = getAuthToken();
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCsrf) {
    const csrf = await ensureCsrfToken();
    if (csrf) {
      options.headers = { ...options.headers, 'X-CSRFToken': csrf };
    }
  }

  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  };

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
      const err = new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      err.validationErrors = errorData;
      throw err;
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
  getCurrentUser: async () => apiRequest('/current-user/'),

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
    
    // Создаем заголовки с токеном
    const headers = {};
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const csrf = await ensureCsrfToken();
    if (csrf) headers['X-CSRFToken'] = csrf;

    const response = await fetch(`${API_URL}/files/`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
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
  deleteFile: async fileId => apiRequest(`/files/${fileId}/`, {
    method: 'DELETE',
  }),

  // Переименовать файл
  renameFile: async (fileId, newName) => apiRequest(`/files/${fileId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ original_name: newName }),
  }),

  // Скачать файл
  downloadFile: async (fileId, fileName) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
      headers: { ...(token && { Authorization: `Token ${token}` }) },
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
  getUsers: async () => apiRequest('/users/'),

  // Удалить пользователя
  deleteUser: async userId => apiRequest(`/users/${userId}/`, {
    method: 'DELETE',
  }),

  // Обновить пользователя (изменение прав администратора)
  updateUser: async (userId, isAdmin) => apiRequest(`/users/${userId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_admin: isAdmin }),
  }),

  // Изменение комментария к файлу
  updateFileComment: async (fileId, comment) => apiRequest(`/files/${fileId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ comment }),
  }),

  // Просмотр файла в браузере
  viewFile: async fileId => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/files/${fileId}/view/`, {
      headers: { ...(token && { Authorization: `Token ${token}` }) },
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
