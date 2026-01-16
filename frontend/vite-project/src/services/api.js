const API_URL = 'http://127.0.0.1:8000/api';

export const api = {
  // Регистрация
  register: async (username, email, password, full_name) => {
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username,      // НЕ login!
        email, 
        password, 
        full_name      // НЕ fullName!
      })
    });
    return response.json();
  },

  // Вход
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
    }
    return data;
  },

  // Получить список файлов
  getFiles: async (userId = null) => {
    const token = localStorage.getItem('token');
    const url = userId ? `${API_URL}/files/?user_id=${userId}` : `${API_URL}/files/`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.json();
  },

  // Загрузить файл
  uploadFile: async (file, comment) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);
    
    const response = await fetch(`${API_URL}/files/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` },
      body: formData
    });
    return response.json();
  },

  // Удалить файл
  deleteFile: async (fileId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/files/${fileId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.ok;
  },

  renameFile: async (fileId, newName) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/files/${fileId}/`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ original_name: newName })
    });
    return response.json();
  },

  downloadFile: async (fileId, fileName) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
      method: 'GET',
      headers: { 
        'Authorization': `Token ${token}` 
      }
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
      console.error('Ошибка при скачивании');
      alert('Не удалось скачать файл. Возможно, истек токен.');
    }
  },

  getUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.json();
  },

  deleteUser: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${userId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.ok;
  },

  updateUser: async (userId, isAdmin) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${userId}/`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_admin: isAdmin })
    });
    return response.json();
  },

  // Изменение комментария к файлу
  updateFileComment: async (fileId, comment) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/files/${fileId}/`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment: comment })
    });
    return response.json();
  },

  // Просмотр файла в браузере
  viewFile: async (fileId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/files/${fileId}/view/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }
};