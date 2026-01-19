"""
Settings module - автоматически выбирает настройки в зависимости от переменной окружения DJANGO_SETTINGS_MODULE
По умолчанию используется prod.py для production
"""
import os

# По умолчанию используем настройки production
# Для разработки установите: export DJANGO_SETTINGS_MODULE=mycloud.settings.dev
if os.environ.get('DJANGO_SETTINGS_MODULE') == 'mycloud.settings':
    from .prod import *
