#!/bin/bash

# Скрипт для загрузки файлов в репозиторий doctor-queue-sim.github.io

echo "=== Загрузка файлов в репозиторий doctor-queue-sim.github.io ==="

# Проверка наличия Git
if ! command -v git &> /dev/null; then
    echo "Ошибка: Git не установлен"
    exit 1
fi

# URL репозитория
REPO_URL="https://github.com/axtrace/doctor-queue-sim.github.io.git"
REPO_NAME="doctor-queue-sim.github.io"

# Создание временной папки
TEMP_DIR="/tmp/queue_sim_upload"
mkdir -p $TEMP_DIR
cd $TEMP_DIR

echo "Клонирование репозитория..."
git clone $REPO_URL
cd $REPO_NAME

echo "Копирование файлов..."

# Основные файлы
cp /Users/sofinma/Desktop/trust/index.html .
cp /Users/sofinma/Desktop/trust/README.md .
cp /Users/sofinma/Desktop/trust/favicon.png .

# Папка js
mkdir -p js/lib
mkdir -p js/sims

cp /Users/sofinma/Desktop/trust/js/lib/helpers.js js/lib/
cp /Users/sofinma/Desktop/trust/js/lib/pixi.min.js js/lib/
cp /Users/sofinma/Desktop/trust/js/lib/tweenjs-0.6.2.min.js js/lib/

cp /Users/sofinma/Desktop/trust/js/sims/QueueSimulationProfessional.js js/sims/
cp /Users/sofinma/Desktop/trust/js/sims/QueueUIProfessional.js js/sims/

# Дополнительные файлы (опционально)
cp /Users/sofinma/Desktop/trust/queue_professional.html .
cp /Users/sofinma/Desktop/trust/test_professional_queue.html .
cp /Users/sofinma/Desktop/trust/PROFESSIONAL_QUEUE_DOCUMENTATION.md .
cp /Users/sofinma/Desktop/trust/GITHUB_PAGES_SETUP.md .

echo "Добавление файлов в Git..."
git add .

echo "Коммит изменений..."
git commit -m "Добавление профессиональной симуляции очереди к врачам

- Главная страница с автоматическим запуском
- Профессиональная модель M/M/c
- Интерфейс управления с реальными метриками
- Документация и инструкции"

echo "Отправка на GitHub..."
git push origin main

echo "Очистка временных файлов..."
cd /tmp
rm -rf $TEMP_DIR

echo "=== Загрузка завершена ==="
echo ""
echo "Далее необходимо настроить GitHub Pages:"
echo "1. Перейдите в репозиторий: https://github.com/axtrace/doctor-queue-sim.github.io"
echo "2. Settings → Pages → Source: main branch → Save"
echo "3. Сайт будет доступен по адресу: https://axtrace.github.io/doctor-queue-sim.github.io/"
echo ""
echo "Проверка через 5-10 минут..."
