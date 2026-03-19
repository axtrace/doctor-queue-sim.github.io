# Настройка для доступа по адресу https://doctor-queue-sim.github.io/

Чтобы сайт был доступен по короткому адресу `https://doctor-queue-sim.github.io/` (без имени пользователя), нужно создать организацию GitHub.

## Вариант 1: Создание организации (рекомендуется)

### Шаг 1: Создайте организацию GitHub

1. Перейдите на https://github.com/organizations/plan
2. Нажмите "Create a free organization"
3. Введите имя организации: `doctor-queue-sim`
4. Укажите контактный email
5. Выберите "My personal account" (для бесплатного плана)
6. Завершите создание организации

### Шаг 2: Перенесите репозиторий в организацию

1. Перейдите в настройки текущего репозитория:
   https://github.com/axtrace/doctor-queue-sim.github.io/settings

2. Прокрутите вниз до раздела "Danger Zone"

3. Нажмите "Transfer ownership"

4. Введите:
   - New owner: `doctor-queue-sim`
   - Repository name: `doctor-queue-sim.github.io`

5. Подтвердите перенос

### Шаг 3: Обновите локальный репозиторий

После переноса обновите URL удаленного репозитория:

```bash
cd /Users/sofinma/github/doctor-queue-sim.github.io
git remote set-url origin https://github.com/doctor-queue-sim/doctor-queue-sim.github.io.git
git remote -v  # Проверка
```

### Шаг 4: Настройте GitHub Pages

1. Перейдите в Settings → Pages нового репозитория
2. Source: `main` branch, `/ (root)` folder
3. Нажмите "Save"

### Результат:
Сайт будет доступен по адресу: **https://doctor-queue-sim.github.io/**

---

## Вариант 2: Переименование аккаунта (не рекомендуется)

Если вы хотите переименовать свой личный аккаунт:

1. Перейдите в Settings вашего аккаунта
2. В разделе "Account" нажмите "Change username"
3. Введите новое имя: `doctor-queue-sim`
4. Подтвердите изменение

**Внимание:** Это изменит URL всех ваших репозиториев!

---

## Вариант 3: Использование custom domain

Если у вас есть собственный домен:

1. Купите домен `doctor-queue-sim.com` (или любой другой)

2. Создайте файл `CNAME` в корне репозитория:
```bash
echo "doctor-queue-sim.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

3. Настройте DNS записи у регистратора:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: CNAME
Name: www
Value: axtrace.github.io
```

4. В Settings → Pages укажите custom domain

### Результат:
Сайт будет доступен по адресу: **https://doctor-queue-sim.com/**

---

## Текущее состояние

**Текущий URL репозитория:**
https://github.com/axtrace/doctor-queue-sim.github.io

**Текущий URL сайта:**
https://axtrace.github.io/doctor-queue-sim.github.io/

**Желаемый URL сайта:**
https://doctor-queue-sim.github.io/

**Рекомендация:** Используйте Вариант 1 (создание организации) - это самый простой и правильный способ.
