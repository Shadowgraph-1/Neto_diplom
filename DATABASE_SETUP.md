# Настройка базы данных

## Важно!

**База данных PostgreSQL НЕ создается автоматически.** Вам нужно:

1. ✅ **Создать саму базу данных** в PostgreSQL (вручную)
2. ✅ **Применить миграции Django** (автоматически создадут таблицы)
3. ✅ **Создать администратора** (через скрипт)

## Пошаговая инструкция

### Шаг 1: Проверка наличия PostgreSQL

Убедитесь, что PostgreSQL установлен и запущен:

```bash
# Windows
# Проверьте службу PostgreSQL в "Службы" (Services)

# Linux/Mac
sudo systemctl status postgresql
```

### Шаг 2: Создание базы данных

#### Вариант A: Через командную строку (psql)

```bash
# Подключитесь к PostgreSQL как администратор
psql -U postgres

# Или для Windows, если PostgreSQL на порту 5433:
psql -U postgres -p 5433
```

Затем выполните SQL команды:

```sql
-- Создание базы данных
CREATE DATABASE mycloud_db;

-- Создание пользователя (если еще не создан)
CREATE USER mycloud_user WITH PASSWORD 'your_secure_password';

-- Настройка прав
ALTER ROLE mycloud_user SET client_encoding TO 'utf8';
ALTER ROLE mycloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mycloud_user SET timezone TO 'UTC';

-- Выдача прав на базу данных
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;

-- Подключение к созданной БД для выдачи прав на схему
\c mycloud_db
GRANT ALL ON SCHEMA public TO mycloud_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mycloud_user;

-- Выход
\q
```

#### Вариант B: Через pgAdmin (графический интерфейс)

1. Откройте pgAdmin
2. Подключитесь к серверу PostgreSQL
3. Правой кнопкой на "Databases" → "Create" → "Database"
4. Имя: `mycloud_db`
5. Сохраните
6. Создайте пользователя: Правой кнопкой на "Login/Group Roles" → "Create" → "Login/Group Role"
7. Укажите имя и пароль
8. На вкладке "Privileges" выдайте нужные права

### Шаг 3: Настройка переменных окружения

Создайте файл `.env` в папке `backend/mycloud/`:

```bash
# База данных
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432  # или 5433, если ваш PostgreSQL на другом порту

# Django
SECRET_KEY=your-secret-key-here-min-50-characters
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost,127.0.0.1
```

### Шаг 4: Применение миграций (создание таблиц)

После создания БД примените миграции Django - они автоматически создадут все таблицы:

```bash
cd backend/mycloud

# Активируйте виртуальное окружение (если не активировано)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Примените миграции
python manage.py migrate
```

Это создаст:
- Таблицу пользователей (User)
- Таблицу файлов (File)
- Все необходимые связи и индексы
- Таблицы Django (сессии, миграции и т.д.)

### Шаг 5: Создание администратора

После применения миграций создайте администратора:

```bash
python manage.py shell
```

В интерактивной оболочке выполните:
```python
exec(open('manage_admin.py').read())
```

Или используйте отдельный скрипт:
```bash
python create_admin.py
```

**Данные администратора по умолчанию:**
- Логин: `admin`
- Пароль: `Admin123!`
- Email: `admin@example.com`

**⚠️ ВАЖНО:** Смените пароль после первого входа!

## Проверка подключения

Проверьте, что все работает:

```bash
python manage.py dbshell
```

Если подключение успешно, вы увидите приглашение PostgreSQL (`mycloud_db=#`). Введите `\q` для выхода.

Или проверьте через Django:

```bash
python manage.py shell
```

```python
from cloud_storage.models import User
print(f"Пользователей в БД: {User.objects.count()}")
```

## Если база данных уже существует

Если база данных `mycloud_db` уже существует:

1. Проверьте, что данные в `.env` совпадают с существующей БД
2. Просто примените миграции: `python manage.py migrate`
3. Если миграции уже применены, Django сообщит: "No migrations to apply"

## Если нужно пересоздать базу данных

⚠️ **ВНИМАНИЕ:** Это удалит все данные!

```sql
-- Подключитесь к postgres БД
psql -U postgres
```

```sql
-- Завершите все подключения к базе
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'mycloud_db' AND pid <> pg_backend_pid();

-- Удалите базу данных
DROP DATABASE mycloud_db;

-- Создайте заново
CREATE DATABASE mycloud_db;
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
\q
```

Затем примените миграции:
```bash
python manage.py migrate
```

## Частые проблемы

### Ошибка: "FATAL: database "mycloud_db" does not exist"
**Решение:** База данных не создана. Выполните Шаг 2.

### Ошибка: "FATAL: password authentication failed"
**Решение:** 
- Проверьте пароль в `.env` файле
- Убедитесь, что пользователь `mycloud_user` существует
- Проверьте `DB_USER` в `.env`

### Ошибка: "could not connect to server"
**Решение:**
- Проверьте, что PostgreSQL запущен
- Проверьте `DB_HOST` и `DB_PORT` в `.env`
- Проверьте, что PostgreSQL слушает на указанном порту

### Ошибка: "permission denied for database"
**Решение:** Выдайте права пользователю (см. Шаг 2, команда GRANT)

## Следующие шаги

После настройки БД:
1. ✅ Примените миграции
2. ✅ Создайте администратора
3. ✅ Соберите фронтенд: `cd frontend/vite-project && npm run build`
4. ✅ Соберите статические файлы Django: `python manage.py collectstatic`
5. ✅ Запустите сервер для проверки
