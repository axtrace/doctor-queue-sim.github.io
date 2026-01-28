// Профессиональный интерфейс управления для симуляции очереди
function QueueUIProfessional(config){

    var self = this;

    // Конфигурация
    self.container = config.container;
    self.simulation = config.simulation;

    // Элементы UI
    self.controlsContainer = null;
    self.statsContainer = null;
    self.parametersContainer = null;

    // Инициализация
    self.init = function(){
        self.createControls();
        self.createParametersPanel();
        self.createStatsPanel();
        self.updateStats();
    };

    // Создание панели управления
    self.createControls = function(){
        self.controlsContainer = document.createElement('div');
        self.controlsContainer.className = 'queue-controls';
        self.controlsContainer.style.cssText = `
            margin: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            border: 1px solid #ddd;
        `;

        var controlsHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="startBtn" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Старт
                </button>
                <button id="stopBtn" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Стоп
                </button>
                <button id="stepBtn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Шаг
                </button>
                <button id="resetBtn" style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Сброс
                </button>
            </div>
            <div style="font-size: 14px; color: #666;">
                <div>Текущее время: <span id="currentTime">0</span> мин</div>
                <div>Длительность смены: <span id="shiftTime">${self.simulation.shiftMinutes}</span> мин</div>
            </div>
        `;

        self.controlsContainer.innerHTML = controlsHTML;
        self.container.appendChild(self.controlsContainer);

        // Обработчики событий
        document.getElementById('startBtn').addEventListener('click', function(){
            self.simulation.start();
        });

        document.getElementById('stopBtn').addEventListener('click', function(){
            self.simulation.stop();
        });

        document.getElementById('stepBtn').addEventListener('click', function(){
            self.simulation.step();
        });

        document.getElementById('resetBtn').addEventListener('click', function(){
            self.simulation.reset();
        });

        // Подписка на события симуляции
        self.simulation.onStep = function(){
            self.updateStats();
            document.getElementById('currentTime').textContent = Math.round(self.simulation.currentTime);
        };

        self.simulation.onReset = function(){
            self.updateStats();
            document.getElementById('currentTime').textContent = '0';
        };
    };

    // Создание панели параметров
    self.createParametersPanel = function(){
        self.parametersContainer = document.createElement('div');
        self.parametersContainer.className = 'queue-parameters';
        self.parametersContainer.style.cssText = `
            margin: 20px;
            padding: 15px;
            background: #f0f8ff;
            border-radius: 8px;
            border: 1px solid #b3d9ff;
        `;

        var paramsHTML = `
            <h3 style="margin-top: 0; color: #0066cc;">Параметры симуляции</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                        Интенсивность прихода (λ):
                    </label>
                    <input type="number" id="arrivalRate" value="${self.simulation.arrivalRatePerHour}"
                           min="1" max="100" step="1" style="width: 100px; padding: 4px;">
                    <span>пациентов/час</span>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                        Среднее время приёма:
                    </label>
                    <input type="number" id="serviceTime" value="${self.simulation.meanServiceMinutes}"
                           min="1" max="60" step="1" style="width: 100px; padding: 4px;">
                    <span>минут</span>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                        Количество врачей:
                    </label>
                    <input type="number" id="numDoctors" value="${self.simulation.numDoctors}"
                           min="1" max="10" step="1" style="width: 100px; padding: 4px;">
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                        Длительность смены:
                    </label>
                    <input type="number" id="shiftMinutes" value="${self.simulation.shiftMinutes / 60}"
                           min="1" max="24" step="1" style="width: 100px; padding: 4px;">
                    <span>часов</span>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                        SLA (макс. время ожидания):
                    </label>
                    <input type="number" id="slaMinutes" value="${self.simulation.slaMinutes}"
                           min="1" max="120" step="1" style="width: 100px; padding: 4px;">
                    <span>минут</span>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                        Случайный сид:
                    </label>
                    <input type="number" id="randomSeed" value="${self.simulation.randomSeed}"
                           style="width: 100px; padding: 4px;">
                </div>
            </div>

            <button id="applyParams" style="margin-top: 15px; padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Применить параметры
            </button>
        `;

        self.parametersContainer.innerHTML = paramsHTML;
        self.container.appendChild(self.parametersContainer);

        // Обработчик применения параметров
        document.getElementById('applyParams').addEventListener('click', function(){
            self.applyParameters();
        });
    };

    // Применение параметров
    self.applyParameters = function(){
        var arrivalRate = parseInt(document.getElementById('arrivalRate').value);
        var serviceTime = parseInt(document.getElementById('serviceTime').value);
        var numDoctors = parseInt(document.getElementById('numDoctors').value);
        var shiftHours = parseInt(document.getElementById('shiftMinutes').value);
        var slaMinutes = parseInt(document.getElementById('slaMinutes').value);
        var randomSeed = parseInt(document.getElementById('randomSeed').value);

        // Валидация
        if(arrivalRate < 1 || arrivalRate > 100) {
            alert('Интенсивность прихода должна быть от 1 до 100 пациентов/час');
            return;
        }
        if(serviceTime < 1 || serviceTime > 60) {
            alert('Среднее время приёма должно быть от 1 до 60 минут');
            return;
        }
        if(numDoctors < 1 || numDoctors > 10) {
            alert('Количество врачей должно быть от 1 до 10');
            return;
        }
        if(shiftHours < 1 || shiftHours > 24) {
            alert('Длительность смены должна быть от 1 до 24 часов');
            return;
        }
        if(slaMinutes < 1 || slaMinutes > 120) {
            alert('SLA должно быть от 1 до 120 минут');
            return;
        }

        // Остановка симуляции перед изменением параметров
        var wasRunning = self.simulation.isRunning;
        if(wasRunning) self.simulation.stop();

        // Обновление параметров
        self.simulation.arrivalRatePerHour = arrivalRate;
        self.simulation.meanServiceMinutes = serviceTime;
        self.simulation.numDoctors = numDoctors;
        self.simulation.shiftMinutes = shiftHours * 60;
        self.simulation.slaMinutes = slaMinutes;
        self.simulation.randomSeed = randomSeed;

        // Переинициализация генератора случайных чисел
        self.simulation.random = new Math.seedrandom(randomSeed.toString());

        // Переинициализация врачей
        self.simulation.initDoctors();

        // Обновление отображения длительности смены
        document.getElementById('shiftTime').textContent = self.simulation.shiftMinutes;

        // Перезапуск симуляции, если она была запущена
        if(wasRunning) self.simulation.start();

        self.updateStats();
    };

    // Создание панели статистики
    self.createStatsPanel = function(){
        self.statsContainer = document.createElement('div');
        self.statsContainer.className = 'queue-stats';
        self.statsContainer.style.cssText = `
            margin: 20px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 8px;
            border: 1px solid #ffeaa7;
        `;

        var statsHTML = `
            <h3 style="margin-top: 0; color: #856404;">Метрики производительности</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div><strong>Среднее время ожидания:</strong></div>
                <div id="meanWaitTime">0.0 мин</div>

                <div><strong>95-й перцентиль ожидания:</strong></div>
                <div id="p95WaitTime">0.0 мин</div>

                <div><strong>Доля в SLA (≤${self.simulation.slaMinutes} мин):</strong></div>
                <div id="slaShare">0.0%</div>

                <div><strong>Пропускная способность:</strong></div>
                <div id="throughput">0 пациентов</div>

                <div><strong>Загрузка врачей:</strong></div>
                <div id="utilization">0.0%</div>

                <div><strong>Макс. длина очереди:</strong></div>
                <div id="maxQueueLength">0</div>

                <div><strong>Обслужено пациентов:</strong></div>
                <div id="completedPatients">0</div>

                <div><strong>Текущая длина очереди:</strong></div>
                <div id="currentQueueLength">0</div>
            </div>
        `;

        self.statsContainer.innerHTML = statsHTML;
        self.container.appendChild(self.statsContainer);
    };

    // Обновление статистики
    self.updateStats = function(){
        if(!self.statsContainer) return;

        var stats = self.simulation.getStats();

        document.getElementById('meanWaitTime').textContent = stats.meanWaitTime.toFixed(1) + ' мин';
        document.getElementById('p95WaitTime').textContent = stats.p95WaitTime.toFixed(1) + ' мин';
        document.getElementById('slaShare').textContent = (stats.slaShare * 100).toFixed(1) + '%';
        document.getElementById('throughput').textContent = stats.throughput + ' пациентов';
        document.getElementById('utilization').textContent = (stats.utilization * 100).toFixed(1) + '%';
        document.getElementById('maxQueueLength').textContent = stats.maxQueueLength;
        document.getElementById('completedPatients').textContent = self.simulation.completedPatients.length;
        document.getElementById('currentQueueLength').textContent = self.simulation.waitingPatients.length;
    };

    // Инициализация при создании
    self.init();

}
