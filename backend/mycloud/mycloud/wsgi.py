"""
WSGI config for mycloud project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Для production установите переменную окружения DJANGO_SETTINGS_MODULE=mycloud.settings.prod
# По умолчанию используется dev
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mycloud.settings.prod')

application = get_wsgi_application()
