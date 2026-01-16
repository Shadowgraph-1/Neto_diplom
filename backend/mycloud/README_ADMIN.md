# Создание администратора

Для создания администратора в системе выполните одну из следующих команд:

## Способ 1: Через Django shell

```bash
cd backend/mycloud
python manage.py shell
```

Затем в интерактивной оболочке выполните:
```python
exec(open('manage_admin.py').read())
```

## Способ 2: Через отдельный скрипт

```bash
cd backend/mycloud
python create_admin.py
```

## Способ 3: Через стандартную команду Django

```bash
cd backend/mycloud
python manage.py createsuperuser
```

**Примечание:** При использовании способа 3 нужно будет вручную установить `is_admin=True` через Django admin или через shell.

## Данные по умолчанию

- **Логин:** admin
- **Пароль:** Admin123!
- **Email:** admin@example.com

**ВАЖНО:** Измените пароль после первого входа!
