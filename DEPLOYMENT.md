# Инструкция по развертыванию проекта My Cloud

## Структура проекта

Проект состоит из двух частей:
- **Backend**: Django REST Framework приложение (папка `backend/mycloud`)
- **Frontend**: React приложение на Vite (папка `frontend/vite-project`)

## Предварительные требования

### Для локальной разработки:
- Python 3.10 или выше
- Node.js 18.0 или выше
- PostgreSQL 12 или выше
- pip (менеджер пакетов Python)
- npm или yarn (менеджер пакетов Node.js)

### Для production на reg.ru:
- Доступ к серверу с установленным Python, Node.js, PostgreSQL
- Права на настройку веб-сервера (nginx/apache)
- SSH доступ к серверу

## Локальная установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/Shadowgraph-1/Neto_diplom.git
cd Neto_diplom
```

### 2. Настройка Backend

#### 2.1. Создание виртуального окружения

```bash
cd backend/mycloud
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 2.2. Установка зависимостей

```bash
pip install -r ../requirements.txt
```

#### 2.3. Настройка базы данных PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE mycloud_db;
CREATE USER mycloud_user WITH PASSWORD 'your_password';
ALTER ROLE mycloud_user SET client_encoding TO 'utf8';
ALTER ROLE mycloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mycloud_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
```

#### 2.4. Настройка переменных окружения

Создайте файл `.env` в папке `backend/mycloud/` на основе `.env.example`:

```bash
# База данных
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Примечание:** По умолчанию проект использует **production настройки**. Для локальной разработки установите переменную окружения:
```bash
# Windows PowerShell
$env:DJANGO_SETTINGS_MODULE="mycloud.settings.dev"

# Windows CMD
set DJANGO_SETTINGS_MODULE=mycloud.settings.dev

# Linux/Mac
export DJANGO_SETTINGS_MODULE=mycloud.settings.dev
```

#### 2.5. Применение миграций

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 2.6. Создание администратора

```bash
python manage.py shell
```

В интерактивной оболочке:
```python
exec(open('manage_admin.py').read())
```

Или используйте отдельный скрипт:
```bash
python create_admin.py
```

Данные по умолчанию:
- Логин: `admin`
- Пароль: `Admin123!`
- Email: `admin@example.com`

**ВАЖНО:** Смените пароль после первого входа!

#### 2.7. Сборка фронтенда для бэкенда

```bash
cd ../../frontend/vite-project
npm install
npm run build
```

Это создаст папку `dist` со статическими файлами.

#### 2.8. Копирование статических файлов фронтенда

```bash
# Вернуться в папку бэкенда
cd ../../backend/mycloud

# Скопировать собранные файлы фронтенда в static директорию Django
# (или настроить STATICFILES_DIRS в settings.py)
```

#### 2.9. Запуск сервера разработки

```bash
python manage.py runserver
```

Сервер будет доступен по адресу: `http://127.0.0.1:8000`

### 3. Настройка Frontend (для разработки)

#### 3.1. Установка зависимостей

```bash
cd frontend/vite-project
npm install
```

#### 3.2. Запуск dev-сервера

```bash
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:5173`

## Развертывание на production (reg.ru)

### 1. Подготовка сервера

#### 1.1. Установка зависимостей на сервере

```bash
# Python и pip
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv

# PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Node.js (для сборки фронтенда)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx (для веб-сервера)
sudo apt-get install nginx
```

#### 1.2. Создание пользователя для приложения

```bash
sudo adduser mycloud
sudo su - mycloud
```

### 2. Развертывание Backend

#### 2.1. Загрузка кода на сервер

```bash
# Через Git
git clone https://github.com/Shadowgraph-1/Neto_diplom.git /home/mycloud/mycloud_app
cd /home/mycloud/mycloud_app/backend/mycloud

# Или через SCP/SFTP (загрузите файлы проекта вручную)
```

#### 2.2. Настройка виртуального окружения

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

#### 2.3. Настройка базы данных

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE mycloud_db;
CREATE USER mycloud_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
\q
```

#### 2.4. Настройка переменных окружения

Создайте `.env` файл с production настройками:

```bash
# База данных
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432

# Django (ОБЯЗАТЕЛЬНО для production!)
SECRET_KEY=generate-secure-random-key-here-min-50-chars
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,IP-адрес-сервера

# CSRF и CORS (ОБЯЗАТЕЛЬНО для production!)
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# SSL (если используете HTTPS)
SECURE_SSL_REDIRECT=True
```

**ВАЖНО:** 
- Проект настроен на **production режим по умолчанию**
- Для разработки установите: `export DJANGO_SETTINGS_MODULE=mycloud.settings.dev`
- Обязательно настройте `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` и `CORS_ALLOWED_ORIGINS` для вашего домена

#### 2.5. Сборка фронтенда

```bash
cd /home/mycloud/mycloud_app/frontend/vite-project
npm install
npm run build
```

Собранные файлы будут в папке `dist`.

#### 2.6. Настройка статических файлов Django

В `settings.py` (prod.py) убедитесь, что настроены:

```python
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

Соберите статические файлы:

```bash
cd /home/mycloud/mycloud_app/backend/mycloud
python manage.py collectstatic --noinput
```

#### 2.7. Применение миграций

```bash
python manage.py migrate
```

#### 2.8. Создание администратора

```bash
python manage.py shell
exec(open('manage_admin.py').read())
```

### 3. Настройка Gunicorn

#### 3.1. Установка Gunicorn

```bash
pip install gunicorn
```

#### 3.2. Создание systemd службы

Создайте файл `/etc/systemd/system/mycloud.service`:

```ini
[Unit]
Description=MyCloud Gunicorn daemon
After=network.target

[Service]
User=mycloud
Group=www-data
WorkingDirectory=/home/mycloud/mycloud_app/backend/mycloud
Environment="PATH=/home/mycloud/mycloud_app/backend/mycloud/venv/bin"
ExecStart=/home/mycloud/mycloud_app/backend/mycloud/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/mycloud/mycloud_app/backend/mycloud/mycloud.sock \
    mycloud.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### 3.3. Запуск службы

```bash
sudo systemctl daemon-reload
sudo systemctl start mycloud
sudo systemctl enable mycloud
```

### 4. Настройка Nginx

Создайте файл `/etc/nginx/sites-available/mycloud`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /static/ {
        alias /home/mycloud/mycloud_app/backend/mycloud/staticfiles/;
    }

    location /media/ {
        alias /home/mycloud/mycloud_app/backend/mycloud/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/mycloud/mycloud_app/backend/mycloud/mycloud.sock;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Настройка SSL (HTTPS)

Рекомендуется использовать Let's Encrypt:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Структура файлов проекта

```
Neto_diplom/
├── backend/
│   ├── mycloud/
│   │   ├── cloud_storage/          # Django приложение
│   │   │   ├── migrations/         # Миграции БД
│   │   │   ├── models.py          # Модели данных
│   │   │   ├── views.py           # API views
│   │   │   ├── serializers.py     # DRF сериализаторы
│   │   │   └── urls.py            # URL маршруты
│   │   ├── mycloud/               # Настройки проекта
│   │   │   ├── settings/          # Разделенные настройки
│   │   │   │   ├── base.py       # Базовые настройки
│   │   │   │   ├── dev.py        # Настройки разработки
│   │   │   │   └── prod.py       # Production настройки
│   │   │   ├── urls.py           # Главный URL конфиг
│   │   │   └── wsgi.py           # WSGI конфиг
│   │   ├── media/                # Загруженные файлы
│   │   ├── staticfiles/          # Статические файлы Django
│   │   ├── manage.py             # Django management
│   │   ├── create_admin.py       # Скрипт создания админа
│   │   └── manage_admin.py       # Скрипт для shell
│   └── requirements.txt          # Python зависимости
├── frontend/
│   └── vite-project/             # React приложение
│       ├── src/                  # Исходный код
│       │   ├── components/       # React компоненты
│       │   ├── pages/           # Страницы приложения
│       │   └── services/        # API сервисы
│       └── dist/                # Собранные файлы (после build)
└── README.md                     # Основная документация
└── DEPLOYMENT.md                 # Этот файл
```

## Проверка работоспособности

После развертывания проверьте:

1. **Доступность главной страницы**: `http://your-domain.com`
2. **Регистрация нового пользователя**
3. **Вход в систему**
4. **Загрузка файла**
5. **Скачивание файла**
6. **Работа административной панели** (для админа)
7. **Специальная ссылка на файл**

## Решение проблем

### Ошибка подключения к БД

Проверьте:
- Правильность данных в `.env`
- Доступность PostgreSQL сервера
- Права пользователя БД

### Ошибка 500 на сервере

Проверьте логи:
```bash
sudo journalctl -u mycloud -f
sudo tail -f /var/log/nginx/error.log
```

### Статические файлы не загружаются

Убедитесь, что:
- Выполнена команда `collectstatic`
- Nginx настроен на отдачу `/static/` и `/media/`
- Права на папки корректны: `chmod -R 755 staticfiles media`

### CORS ошибки

Проверьте настройки `CORS_ALLOWED_ORIGINS` в settings.py

## Обновление приложения

При обновлении кода:

```bash
cd /home/mycloud/mycloud_app
git pull

cd backend/mycloud
source venv/bin/activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

sudo systemctl restart mycloud
```

## Контакты и поддержка

При возникновении проблем проверьте:
- Логи приложения: `sudo journalctl -u mycloud -f`
- Логи Nginx: `sudo tail -f /var/log/nginx/error.log`
- Логи Django: смотреть в консоль при DEBUG=True
