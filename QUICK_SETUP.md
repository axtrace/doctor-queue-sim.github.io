# Быстрая настройка GitHub Pages

## Проблема
Репозиторий: `https://github.com/axtrace/doctor-queue-sim.github.io`
Сайт: `doctor-queue-sim.github.io` показывает 404

## Решение за 3 шага

### Шаг 1: Запустите скрипт загрузки

```bash
./upload_to_github.sh
```

Скрипт автоматически:
- Клонирует репозиторий
- Копирует все необходимые файлы
- Делает коммит и отправляет на GitHub

### Шаг 2: Настройте GitHub Pages

1. Перейдите: `https://github.com/axtrace/doctor-queue-sim.github.io/settings/pages`
2. В разделе **Source** выберите:
   - Branch: `main`
   - Folder: `/` (root)
3. Нажмите **Save**

### Шаг 3: Проверьте сайт

Через 5-10 минут сайт будет доступен по адресу:
**https://axtrace.github.io/doctor-queue-sim.github.io/**

## Ручная загрузка (если скрипт не работает)

### 1. Скопируйте файлы вручную:

**В корень репозитория:**
- `index.html`
- `README.md`
- `favicon.png`

**Папка js/ со всем содержимым:**
- `js/lib/helpers.js`
- `js/lib/pixi.min.js`
- `js/lib/tweenjs-0.6.2.min.js`
- `js/sims/QueueSimulationProfessional.js`
- `js/sims/QueueUIProfessional.js`

### 2. Git команды:

```bash
git add .
git commit -m "Add professional queue simulation"
git push origin main
```

## Проверка

После настройки GitHub Pages:
- ✅ Сайт должен открываться без 404
- ✅ Симуляция должна автоматически запускаться
- ✅ Интерфейс управления должен работать
- ✅ Статистика должна отображаться в реальном времени

## Если все еще 404:

1. **Проверьте настройки Pages** - убедитесь, что выбрана ветка `main`
2. **Подождите 10-15 минут** - публикация может занять время
3. **Проверьте консоль браузера** (F12) на ошибки JavaScript
4. **Убедитесь**, что файл `index.html` находится в корне репозитория

## Альтернативная ссылка

Если основной домен не работает, попробуйте:
`https://axtrace.github.io/doctor-queue-sim.github.io/`

---

**Готовые файлы находятся в текущей папке. Просто запустите скрипт!**
