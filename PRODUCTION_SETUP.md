# Настройка Production режима

## Текущая конфигурация

Проект настроен на **production режим по умолчанию**. Это означает:

- `DEBUG = False` (отключен режим отладки)
- Включены все security настройки (CSRF, SSL, HSTS)
- Используются secure cookies
- Логирование настроено для production

## Файлы настроек

- `backend/mycloud/mycloud/settings/prod.py` - Production настройки (используется по умолчанию)
- `backend/mycloud/mycloud/settings/dev.py` - Настройки для разработки
- `backend/mycloud/mycloud/settings/base.py` - Базовые настройки (общие для всех)

## Переключение между режимами

### Production (по умолчанию)

Проект уже настроен на production. Убедитесь, что в `.env` файле установлены:

```bash
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
SECURE_SSL_REDIRECT=True
```

### Development (для локальной разработки)

Для переключения в режим разработки установите переменную окружения:

**Windows PowerShell:**
```powershell
$env:DJANGO_SETTINGS_MODULE="mycloud.settings.dev"
python manage.py runserver
```

**Windows CMD:**
```cmd
set DJANGO_SETTINGS_MODULE=mycloud.settings.dev
python manage.py runserver
```

**Linux/Mac:**
```bash
export DJANGO_SETTINGS_MODULE=mycloud.settings.dev
python manage.py runserver
```

Или создайте `.env` файл с:
```bash
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Обязательные настройки для Production

### 1. SECRET_KEY

Сгенерируйте безопасный секретный ключ:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 2. ALLOWED_HOSTS

Укажите все домены и IP-адреса, на которых будет работать приложение:
```bash
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,IP-адрес-сервера
```

### 3. CSRF_TRUSTED_ORIGINS

Укажите все домены с протоколом HTTPS:
```bash
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 4. CORS_ALLOWED_ORIGINS

Укажите домены фронтенда (если фронтенд на отдельном домене):
```bash
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 5. База данных

Настройте подключение к PostgreSQL:
```bash
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
```

## Проверка настроек

После настройки проверьте:

1. **DEBUG отключен:**
   ```bash
   python manage.py shell
   >>> from django.conf import settings
   >>> print(settings.DEBUG)  # Должно быть False
   ```

2. **ALLOWED_HOSTS настроен:**
   ```bash
   >>> print(settings.ALLOWED_HOSTS)  # Должен содержать ваш домен
   ```

3. **CSRF защита включена:**
   ```bash
   >>> print(settings.CSRF_COOKIE_SECURE)  # Должно быть True
   ```

## Фронтенд для Production

Для фронтенда создайте `.env.production` файл:

```bash
VITE_API_URL=https://your-domain.com/api
```

Затем соберите проект:
```bash
cd frontend/vite-project
npm run build
```

Собранные файлы будут в папке `dist/`.

## Развертывание

Следуйте инструкциям в [DEPLOYMENT.md](./DEPLOYMENT.md) для полного развертывания на сервере.
