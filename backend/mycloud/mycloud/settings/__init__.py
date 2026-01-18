"""
Settings module - автоматически выбирает настройки в зависимости от переменной окружения DJANGO_SETTINGS_MODULE
По умолчанию используется dev.py для разработки
"""
import os

# По умолчанию используем настройки разработки
# Для production установите: export DJANGO_SETTINGS_MODULE=mycloud.settings.prod
if os.environ.get('DJANGO_SETTINGS_MODULE') == 'mycloud.settings':
    from .dev import *
