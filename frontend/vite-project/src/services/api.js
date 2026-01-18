// Конфигурация API
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Вспомогательная функция для получения CSRF токена из cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Вспомогательная функция для выполнения запросов с сессионной аутентификацией
async function apiRequest(url, options = {}) {
  const csrftoken = getCookie('csrftoken');
  
  const defaultOptions = {
    credentials: 'include', // Важно для сессий и CSRF
    headers: {
      'Content-Type': 'application/json',
      ...(csrftoken && { 'X-CSRFToken': csrftoken }),
      ...options.headers,
    },
    ...options,
  };

  // Для FormData не устанавливаем Content-Type (браузер сделает это сам)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_URL}${url}`, defaultOptions);
    
    // Обработка ошибок
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Произошла ошибка' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Для запросов без тела (DELETE) возвращаем boolean
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
  // Регистрация
  register: async (username, email, password, full_name) => {
    return apiRequest('/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name }),
    });
  },

  // Вход (использует сессионную аутентификацию)
  login: async (username, password) => {
    // Сначала получаем CSRF токен
    await fetch(`${API_URL}/login/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    // Теперь выполняем вход
    return apiRequest('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Выход
  logout: async () => {
    const result = await apiRequest('/logout/', {
      method: 'POST',
    });
    return result;
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
    
    return apiRequest('/files/', {
      method: 'POST',
      body: formData,
      headers: {}, // Убираем заголовки для FormData
    });
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
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(csrftoken && { 'X-CSRFToken': csrftoken }),
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'file');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Ошибка при скачивании' }));
      throw new Error(errorData.error || 'Не удалось скачать файл');
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
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${API_URL}/files/${fileId}/view/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(csrftoken && { 'X-CSRFToken': csrftoken }),
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Ошибка при просмотре' }));
      throw new Error(errorData.error || 'Не удалось открыть файл');
    }
  },
};
