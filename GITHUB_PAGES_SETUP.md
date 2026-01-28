# Настройка GitHub Pages для doctor-queue-sim.github.io

## Текущая ситуация
Репозиторий создан: `https://github.com/axtrace/doctor-queue-sim.github.io`
Сайт показывает 404: `doctor-queue-sim.github.io`

## Решение проблемы

### Шаг 1: Загрузка файлов в репозиторий

Скопируйте следующие файлы в корень репозитория:

**Обязательные файлы:**
- `index.html` - главная страница
- `README.md` - документация
- `favicon.png` - иконка сайта

**Папки:**
- `js/` - все JavaScript файлы
  - `js/sims/QueueSimulationProfessional.js`
  - `js/sims/QueueUIProfessional.js`
  - `js/lib/pixi.min.js`
  - `js/lib/tweenjs-0.6.2.min.js`
  - `js/lib/helpers.js`

### Шаг 2: Настройка GitHub Pages

1. Перейдите в репозиторий: `https://github.com/axtrace/doctor-queue-sim.github.io`
2. Нажмите на вкладку **Settings**
3. В левом меню выберите **Pages**
4. В разделе **Source** выберите:
   - Branch: `main`
   - Folder: `/` (root)
5. Нажмите **Save**

### Шаг 3: Проверка публикации

После сохранения настроек:
- GitHub начнет процесс публикации (занимает 1-10 минут)
- На странице Settings → Pages появится ссылка на опубликованный сайт
- Сайт будет доступен по адресу: `https://axtrace.github.io/doctor-queue-sim.github.io/`

**Важно:** Для пользовательских доменов вида `username.github.io` публикация может занять до 24 часов.

### Шаг 4: Альтернативное решение (если не работает)

Если стандартная настройка не работает, создайте ветку `gh-pages`:

```bash
# Клонируйте репозиторий
git clone https://github.com/axtrace/doctor-queue-sim.github.io.git
cd doctor-queue-sim.github.io

# Создайте ветку gh-pages и переключитесь на нее
git checkout -b gh-pages

# Добавьте файлы
git add .
git commit -m "Initial commit for GitHub Pages"
git push origin gh-pages
```

Затем в настройках GitHub Pages выберите ветку `gh-pages`.

## Структура файлов после загрузки

```
doctor-queue-sim.github.io/
├── index.html
├── README.md
├── favicon.png
├── js/
│   ├── sims/
│   │   ├── QueueSimulationProfessional.js
│   │   └── QueueUIProfessional.js
│   └── lib/
│       ├── pixi.min.js
│       ├── tweenjs-0.6.2.min.js
│       └── helpers.js
├── queue_professional.html
├── test_professional_queue.html
└── PROFESSIONAL_QUEUE_DOCUMENTATION.md
```

## Проверка работы локально

Перед загрузкой проверьте сайт локально:

```bash
python3 -m http.server 8000
```

Откройте: `http://localhost:8000`

## Решение распространенных проблем

### Проблема 1: 404 ошибка
- **Причина**: Файлы не загружены или неправильная настройка Pages
- **Решение**: Проверьте наличие `index.html` в корне и настройки GitHub Pages

### Проблема 2: Белый экран
- **Причина**: Ошибки JavaScript в консоли браузера
- **Решение**: Откройте Developer Tools (F12) и проверьте ошибки

### Проблема 3: Библиотеки не загружаются
- **Причина**: Неправильные пути к файлам
- **Решение**: Убедитесь, что все файлы в папке `js/` загружены

## Быстрая команда для загрузки

Если у вас есть доступ к терминалу и Git:

```bash
# Клонируйте репозиторий
git clone https://github.com/axtrace/doctor-queue-sim.github.io.git
cd doctor-queue-sim.github.io

# Скопируйте файлы из текущей папки trust
cp /Users/sofinma/Desktop/trust/index.html .
cp /Users/sofinma/Desktop/trust/README.md .
cp /Users/sofinma/Desktop/trust/favicon.png .
cp -r /Users/sofinma/Desktop/trust/js .

# Закоммитьте и отправьте
git add .
git commit -m "Add professional queue simulation"
git push origin main
```

## Контрольный список

- [ ] Файл `index.html` загружен в корень репозитория
- [ ] Папка `js/` со всеми подпапками загружена
- [ ] GitHub Pages настроен на ветку `main` и папку `/`
- [ ] Сайт доступен по ссылке из настроек Pages
- [ ] Нет ошибок в консоли браузера

После выполнения этих шагов сайт должен работать по адресу: `https://axtrace.github.io/doctor-queue-sim.github.io/`
