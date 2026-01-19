#!/bin/bash
# Скрипт для запуска Gunicorn на порту 8000 (для тестирования)

# Переход в директорию проекта
cd "$(dirname "$0")"

# Активация виртуального окружения
if [ -d "../venv" ]; then
    source ../venv/bin/activate
elif [ -d "../../venv" ]; then
    source ../../venv/bin/activate
elif [ -d "/home/developer/Neto_diplom/venv" ]; then
    source /home/developer/Neto_diplom/venv/bin/activate
fi

# Проверка что Gunicorn установлен
if ! command -v gunicorn &> /dev/null; then
    echo "Gunicorn не найден. Установите: pip install gunicorn"
    exit 1
fi

# Проверка .env файла
if [ ! -f .env ]; then
    echo "ВНИМАНИЕ: .env файл не найден!"
    echo "Скопируйте .env.example в .env и заполните переменные."
    exit 1
fi

echo "Запуск Gunicorn на 0.0.0.0:8000..."
echo "Для остановки нажмите Ctrl+C"
echo ""

# Запуск Gunicorn на всех интерфейсах порт 8000
gunicorn --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    mycloud.wsgi:application
