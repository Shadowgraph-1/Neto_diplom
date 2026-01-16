"""
Скрипт для создания администратора через manage.py
Использование: python manage.py shell
Затем выполнить: exec(open('manage_admin.py').read())
"""

from cloud_storage.models import User

def create_admin():
    """Создает администратора, если его еще нет"""
    username = 'admin'
    email = 'admin@example.com'
    password = 'Admin123!'
    full_name = 'Администратор'
    
    if User.objects.filter(username=username).exists():
        print(f'Пользователь {username} уже существует')
        user = User.objects.get(username=username)
        user.is_admin = True
        user.set_password(password)
        user.save()
        print(f'Пароль для {username} обновлен, права администратора установлены')
    else:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
            is_admin=True
        )
        print(f'Администратор {username} успешно создан')
        print(f'Логин: {username}')
        print(f'Пароль: {password}')
        print('ВАЖНО: Измените пароль после первого входа!')

create_admin()
