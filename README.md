# My Cloud — облачное хранилище файлов

Дипломный проект по профессии «Fullstack-разработчик на Python». Веб-приложение для хранения, загрузки и обмена файлами с REST API и современным интерфейсом.

---

## Что умеет приложение

- **Регистрация и вход** — логин, email, пароль с валидацией
- **Файловое хранилище** — загрузка, скачивание, удаление, переименование, комментарии
- **Специальные ссылки** — доступ к файлам по уникальной ссылке без авторизации
- **Админ-панель** — управление пользователями, просмотр хранилищ, назначение прав
- **Логирование** — все операции пишутся в лог

---

## Быстрый старт

### Локально (backend + frontend)

```bash
# 1. Клонировать
git clone https://github.com/Shadowgraph-1/Neto_diplom.git
cd Neto_diplom

# 2. Backend
cd backend/mycloud
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r ../requirements.txt

# 3. База данных PostgreSQL + .env (см. DEPLOYMENT.md)
python manage.py migrate
python manage.py createsuperuser

# 4. Запуск backend
python manage.py runserver

# 5. Frontend (в новом терминале)
cd frontend/vite-project
npm install
npm run dev
```

Откройте http://localhost:5173

### Подключение локального фронта к бэкенду на сервере

В `frontend/vite-project/.env` укажите:

```
VITE_API_URL=http://IP_ВАШЕГО_СЕРВЕРА:8000/api
```

Перезапустите `npm run dev`.

---

## Структура проекта

```
Neto_diplom/
├── backend/mycloud/          # Django + DRF
│   ├── cloud_storage/        # Модели, API, логика
│   ├── mycloud/settings/     # base, dev, prod
│   └── make_admin.py         # Скрипт назначения админа
├── frontend/vite-project/    # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/api.js
├── README.md
└── DEPLOYMENT.md             # Полная инструкция по развёртыванию
```

---

## Технологии

| Часть      | Стек                          |
|-----------|-------------------------------|
| Backend   | Django 6, DRF, PostgreSQL     |
| Frontend  | React 18, Vite, React Router  |
| Auth      | Token Authentication (DRF)   |
| Production| Gunicorn, Nginx, systemd      |

---

## Назначение администратора

Через Django shell:

```python
from cloud_storage.models import User
user = User.objects.get(username='ваш_логин')
user.is_admin = True
user.save()
```

Или скрипт: `python make_admin.py ваш_логин`

---

## Документация

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — установка, настройка БД, деплой на reg.ru, решение проблем

---

## Production

Приложение развёрнуто на reg.ru. Подробности — в [DEPLOYMENT.md](./DEPLOYMENT.md).
