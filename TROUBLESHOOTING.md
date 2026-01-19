# Решение проблем с подключением

## Ошибка: ERR_CONNECTION_TIMED_OUT на 130.49.148.127:8000

Эта ошибка означает, что фронтенд не может подключиться к бэкенду. Возможные причины и решения:

### 1. Проверка запущен ли Gunicorn

На сервере выполните:

```bash
# Проверить статус службы
sudo systemctl status mycloud

# Проверить запущенные процессы
ps aux | grep gunicorn

# Проверить логи
sudo journalctl -u mycloud -n 50
```

### 2. Gunicorn не слушает на порту 8000

**Вариант A: Запуск напрямую на порту 8000 (для тестирования)**

Если вы хотите подключиться напрямую к `130.49.148.127:8000`, нужно запустить Gunicorn на TCP порту:

```bash
cd /home/developer/Neto_diplom/backend/mycloud
source /home/developer/Neto_diplom/venv/bin/activate

# Запустить Gunicorn на всех интерфейсах (0.0.0.0) порт 8000
gunicorn --bind 0.0.0.0:8000 --workers 3 mycloud.wsgi:application
```

**Важно:** `0.0.0.0` означает слушать на всех сетевых интерфейсах, не только localhost.

**Вариант B: Использование через Nginx (рекомендуется для production)**

Если вы используете Nginx, настройте его для проксирования:

1. **Проверьте что Gunicorn работает через unix socket:**

```bash
# Проверить существует ли socket файл
ls -la /home/developer/Neto_diplom/backend/mycloud/mycloud.sock

# Если нет, запустите через systemd:
sudo systemctl start mycloud
```

2. **Настройте Nginx для проксирования на порт 8000:**

Создайте/отредактируйте `/etc/nginx/sites-available/mycloud`:

```nginx
server {
    listen 80;
    server_name 130.49.148.127;

    location /static/ {
        alias /home/developer/Neto_diplom/backend/mycloud/staticfiles/;
    }

    location /media/ {
        alias /home/developer/Neto_diplom/backend/mycloud/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Активируйте и перезапустите Nginx:**

```bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Проверка Firewall

Проверьте, что порт 8000 открыт:

```bash
# Проверить открытые порты
sudo netstat -tlnp | grep 8000
# или
sudo ss -tlnp | grep 8000

# Если используете ufw (Ubuntu Firewall)
sudo ufw status
sudo ufw allow 8000/tcp

# Если используете firewalld (CentOS/RHEL)
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### 4. Проверка настройки .env файла

Убедитесь, что в `.env` файле правильно настроен `ALLOWED_HOSTS`:

```bash
cd /home/developer/Neto_diplom/backend/mycloud
nano .env
```

Должно быть:

```bash
ALLOWED_HOSTS=130.49.148.127,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://130.49.148.127:8000
CSRF_TRUSTED_ORIGINS=http://130.49.148.127:8000
```

**ВАЖНО:** После изменения `.env` перезапустите Gunicorn:

```bash
sudo systemctl restart mycloud
# или если запускаете напрямую, перезапустите процесс
```

### 5. Быстрое решение: Запуск напрямую на порту 8000

Для быстрого тестирования можно запустить Gunicorn напрямую:

```bash
cd /home/developer/Neto_diplom/backend/mycloud
source /home/developer/Neto_diplom/venv/bin/activate

# Убедитесь что в .env есть:
# ALLOWED_HOSTS=130.49.148.127,localhost,127.0.0.1

# Запустить Gunicorn на всех интерфейсах
gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 mycloud.wsgi:application
```

**Обратите внимание:**
- `0.0.0.0` - слушать на всех сетевых интерфейсах
- `--timeout 120` - увеличить таймаут для больших файлов
- Логи будут выводиться в консоль

### 6. Проверка подключения с сервера

Проверьте, что сервер отвечает локально:

```bash
# С сервера
curl http://localhost:8000/api/current-user/
curl http://127.0.0.1:8000/api/current-user/

# С внешнего IP (если есть доступ)
curl http://130.49.148.127:8000/api/current-user/
```

### 7. Проверка логов

Проверьте логи для диагностики:

```bash
# Логи Gunicorn (если через systemd)
sudo journalctl -u mycloud -f

# Логи Django
tail -f /home/developer/Neto_diplom/backend/mycloud/logs/django.log

# Логи Nginx (если используется)
sudo tail -f /var/log/nginx/error.log
```

### 8. Типичные ошибки

**Ошибка: "DisallowedHost"**

```
Invalid HTTP_HOST header: '130.49.148.127:8000'. You may need to add '130.49.148.127' to ALLOWED_HOSTS.
```

**Решение:** Добавьте IP в `ALLOWED_HOSTS` в `.env` файле.

**Ошибка: CORS**

```
Access to fetch at 'http://130.49.148.127:8000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение:** Добавьте `http://localhost:5173` в `CORS_ALLOWED_ORIGINS` в `.env`.

**Ошибка: CSRF**

```
403 Forbidden - CSRF verification failed
```

**Решение:** Добавьте источник в `CSRF_TRUSTED_ORIGINS` в `.env`.

## Рекомендуемая последовательность действий

1. **Проверьте что сервер запущен:**
   ```bash
   sudo systemctl status mycloud
   ```

2. **Если нет, запустите напрямую для тестирования:**
   ```bash
   cd /home/developer/Neto_diplom/backend/mycloud
   source /home/developer/Neto_diplom/venv/bin/activate
   gunicorn --bind 0.0.0.0:8000 --workers 3 mycloud.wsgi:application
   ```

3. **Проверьте .env файл:**
   ```bash
   cat .env | grep ALLOWED_HOSTS
   cat .env | grep CORS_ALLOWED_ORIGINS
   ```

4. **Проверьте что порт открыт:**
   ```bash
   sudo netstat -tlnp | grep 8000
   ```

5. **Проверьте подключение:**
   ```bash
   curl http://localhost:8000/api/current-user/
   ```
