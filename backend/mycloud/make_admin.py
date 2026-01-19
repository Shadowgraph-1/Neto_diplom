"""
Скрипт для назначения прав администратора существующему пользователю
Использование: python make_admin.py <username>
Или: python manage.py shell < make_admin.py (если запускается из manage.py shell)
"""

import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mycloud.settings.prod')
django.setup()

from cloud_storage.models import User

def make_admin(username):
    """Назначает права администратора существующему пользователю"""
    try:
        user = User.objects.get(username=username)
        user.is_admin = True
        user.save()
        print(f'✓ Пользователь {username} теперь администратор')
        print(f'  ID: {user.id}')
        print(f'  Email: {user.email}')
        print(f'  Is admin: {user.is_admin}')
        return True
    except User.DoesNotExist:
        print(f'✗ Пользователь {username} не найден')
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        username = sys.argv[1]
        make_admin(username)
    else:
        print("Использование: python make_admin.py <username>")
        print("\nПример: python make_admin.py SGraph")
        
        # Интерактивный режим
        print("\nДоступные пользователи:")
        users = User.objects.all()
        for u in users:
            print(f"  - {u.username} (ID: {u.id}, Admin: {u.is_admin})")
