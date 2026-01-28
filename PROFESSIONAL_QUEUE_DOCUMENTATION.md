# Профессиональная симуляция очереди к врачам

## Обзор

Профессиональная версия симуляции очереди к врачам реализует модель системы массового обслуживания M/M/c с правильными статистическими параметрами и метриками производительности.

## Архитектура

### Основные компоненты

1. **QueueSimulationProfessional** - основная логика симуляции
2. **QueueUIProfessional** - интерфейс управления и отображения статистики
3. **QueuePatientProfessional** - модель пациента
4. **QueueDoctorProfessional** - модель врача

### Параметры симуляции (входы)

| Параметр | Описание | Тип | Диапазон |
|----------|----------|-----|----------|
| `arrivalRatePerHour` | Интенсивность прихода пациентов (λ) | число | 1-100 пациентов/час |
| `meanServiceMinutes` | Среднее время приёма | число | 1-60 минут |
| `numDoctors` | Количество врачей | целое | 1-10 |
| `shiftMinutes` | Длительность смены | число | 60-1440 минут (1-24 часа) |
| `slaMinutes` | Макс. допустимое время ожидания (SLA) | число | 1-120 минут |
| `randomSeed` | Случайный сид для воспроизводимости | число | любое целое |

### Метрики производительности (выходы)

| Метрика | Описание | Формула |
|---------|----------|---------|
| `meanWaitTime` | Среднее время ожидания | Σ(waitTime) / n |
| `p95WaitTime` | 95-й перцентиль времени ожидания | waitTimes[⌊n*0.95⌋] |
| `slaShare` | Доля пациентов в SLA | count(waitTime ≤ SLA) / n |
| `throughput` | Пропускная способность | n (обслужено пациентов) |
| `utilization` | Загрузка врачей | totalBusyTime / (numDoctors * currentTime) |
| `maxQueueLength` | Макс. длина очереди | max(queueLength) |

## Математическая модель

### Распределения

1. **Приход пациентов**: Пуассоновский процесс
   - Межприходное время: Экспоненциальное распределение Exp(λ)
   - λ = arrivalRatePerHour / 60 (пациентов в минуту)

2. **Время обслуживания**: Экспоненциальное распределение
   - Среднее: meanServiceMinutes
   - Распределение: Exp(1/meanServiceMinutes)

### Система M/M/c

- **M** (Memoryless) - экспоненциальное распределение времени между приходами
- **M** (Memoryless) - экспоненциальное распределение времени обслуживания
- **c** - количество каналов обслуживания (врачей)

## Использование

### Быстрый старт

```html
<!DOCTYPE html>
<html>
<head>
    <script src="js/lib/pixi.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>
    <script src="js/sims/QueueSimulationProfessional.js"></script>
    <script src="js/sims/QueueUIProfessional.js"></script>
</head>
<body>
    <div id="simulationContainer"></div>
    <div id="controlsArea"></div>

    <script>
        var app = new PIXI.Application({
            width: 800, height: 500,
            backgroundColor: 0xFFFFFF,
            view: document.getElementById('simulationContainer')
        });

        var simulation = new QueueSimulationProfessional({app: app});
        var ui = new QueueUIProfessional({
            container: document.getElementById('controlsArea'),
            simulation: simulation
        });
    </script>
</body>
</html>
```

### Программное управление

```javascript
// Запуск симуляции
simulation.start();

// Остановка
simulation.stop();

// Пошаговое выполнение
simulation.step();

// Сброс
simulation.reset();

// Получение статистики
var stats = simulation.getStats();
console.log('Среднее время ожидания:', stats.meanWaitTime);
```

### Настройка параметров

```javascript
// Перед изменением параметров остановите симуляцию
simulation.stop();

// Установка новых параметров
simulation.arrivalRatePerHour = 20;  // 20 пациентов/час
simulation.meanServiceMinutes = 15;  // 15 минут на приём
simulation.numDoctors = 3;           // 3 врача
simulation.shiftMinutes = 480;       // 8 часов
simulation.slaMinutes = 20;          // SLA 20 минут
simulation.randomSeed = 12345;       // Фиксированный сид

// Переинициализация
simulation.initDoctors();
simulation.random = new Math.seedrandom('12345');

// Запуск с новыми параметрами
simulation.start();
```

## Примеры сценариев

### Сценарий 1: Стандартная поликлиника
- Интенсивность: 12 пациентов/час
- Время приёма: 10 минут
- Врачи: 2
- Смена: 8 часов
- Ожидаемая загрузка: ~80%

### Сценарий 2: Перегруженная система
- Интенсивность: 30 пациентов/час
- Время приёма: 15 минут
- Врачи: 2
- Смена: 8 часов
- Ожидаемая загрузка: ~94% (система перегружена)

### Сценарий 3: Оптимальная система
- Интенсивность: 20 пациентов/час
- Время приёма: 12 минут
- Врачи: 4
- Смена: 8 часов
- Ожидаемая загрузка: ~50% (комфортный режим)

## Визуализация

### Цветовая схема
- **Синий кружок** (0x0000FF) - врач
- **Красный кружок** (0xFF0000) - пациент на приёме
- **Оранжевый кружок** (0xFFA500) - пациент в очереди

### Расположение элементов
- Врачи: правый край экрана (x=600)
- Очередь: нижняя часть экрана (y=400)
- Пациенты на приёме: рядом с соответствующими врачами

## Ограничения и допущения

1. **Дисциплина очереди**: строго FIFO
2. **Отказы**: пациенты не покидают очередь
3. **Перерывы**: врачи работают без перерывов
4. **Приоритеты**: все пациенты равноправны
5. **Время**: дискретное с шагом 1 минута

## Расширение функциональности

### Добавление новых распределений

```javascript
// Треугольное распределение времени обслуживания
simulation.getServiceTime = function() {
    var min = this.meanServiceMinutes * 0.5;
    var max = this.meanServiceMinutes * 1.5;
    var mode = this.meanServiceMinutes;
    return triangular(min, max, mode);
};
```

### Кастомные метрики

```javascript
// Добавление медианы времени ожидания
simulation.updateStats = function() {
    // Базовая статистика
    // ...

    // Медиана
    if(waitTimes.length > 0) {
        var medianIndex = Math.floor(waitTimes.length / 2);
        this.stats.medianWaitTime = waitTimes[medianIndex];
    }
};
```

## Тестирование

Для тестирования используйте файл `test_professional_queue.html`, который включает:
- Проверку загрузки библиотек
- Тестирование функциональности
- Визуальную проверку
- Сбор статистики

## Производительность

Система оптимизирована для работы в реальном времени:
- До 1000 пациентов за смену
- До 10 врачей
- Плавная анимация перемещения

Для больших нагрузок рекомендуется увеличить шаг симуляции или использовать веб-воркеры.

## Лицензия

Проект распространяется под той же лицензией, что и основной проект "The Evolution of Trust".
