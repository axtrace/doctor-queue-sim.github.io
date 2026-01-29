// Профессиональная версия симуляции очереди с правильными метриками
function QueueSimulationProfessional(config){

    var self = this;

    // APP
    self.app = config.app || new PIXI.Application(800, 500, {backgroundColor: 0xFFFFFF});

    // Контейнеры
    self.waitingContainer = new PIXI.Container();
    self.doctorsContainer = new PIXI.Container();
    self.app.stage.addChild(self.waitingContainer);
    self.app.stage.addChild(self.doctorsContainer);

    // Параметры симуляции (входы)
    self.arrivalRatePerHour = 12; // интенсивность прихода (λ) в час
    self.meanServiceMinutes = 10; // среднее время приёма в минутах
    self.numDoctors = 2; // количество врачей
    self.shiftMinutes = 8 * 60; // длительность смены в минутах (8 часов)
    self.slaMinutes = 15; // SLA - максимальное допустимое время ожидания
    self.randomSeed = 12345; // сид для воспроизводимости

    // Внутренние состояния
    self.currentTime = 0; // текущее время в минутах
    self.isRunning = false;
    self.simulationInterval = null;
    self.timeStep = 1; // шаг симуляции в минутах

    // Очередь и врачи
    self.waitingPatients = [];
    self.doctors = [];
    self.completedPatients = []; // завершенные пациенты для статистики

    // Статистика (выходы)
    self.stats = {
        meanWaitTime: 0,
        p95WaitTime: 0,
        slaShare: 0,
        throughput: 0,
        utilization: 0,
        maxQueueLength: 0,
        totalBusyTime: 0
    };

    // Генератор случайных чисел с сидом
    self.random = new Math.seedrandom(self.randomSeed.toString());

    // Инициализация
    self.init = function(app){
        if(app) {
            self.app = app;
            app.stage.addChild(self.waitingContainer);
            app.stage.addChild(self.doctorsContainer);
        }
        self.initDoctors();
        self.resetStats();
    };

    // Инициализация врачей
    self.initDoctors = function(){
        // Очистка существующих врачей
        while(self.doctors.length > 0){
            var doctor = self.doctors.pop();
            if(doctor.graphics && doctor.graphics.parent){
                doctor.graphics.parent.removeChild(doctor.graphics);
            }
        }

        for(var i=0; i<self.numDoctors; i++){
            var doctor = new QueueDoctorProfessional({
                id: i,
                x: 600,
                y: 100 + i * 120,
                simulation: self
            });
            self.doctorsContainer.addChild(doctor.graphics);
            self.doctors.push(doctor);
        }
    };

    // Генерация времени до следующего пациента (экспоненциальное распределение)
    self.getNextArrivalTime = function(){
        var lambda = self.arrivalRatePerHour / 60; // преобразуем в пациентов в минуту
        return -Math.log(1 - self.random()) / lambda;
    };

    // Генерация времени обслуживания (экспоненциальное распределение)
    self.getServiceTime = function(){
        var mean = self.meanServiceMinutes;
        return -Math.log(1 - self.random()) * mean;
    };

    // Добавление пациента в очередь
    self.addPatient = function(){
        var patient = new QueuePatientProfessional({
            id: self.waitingPatients.length + self.completedPatients.length,
            simulation: self,
            arrivalTime: self.currentTime,
            serviceTime: self.getServiceTime()
        });
        self.waitingContainer.addChild(patient.graphics);
        self.waitingPatients.push(patient);
        patient.updatePosition();

        // Обновление максимальной длины очереди
        self.stats.maxQueueLength = Math.max(self.stats.maxQueueLength, self.waitingPatients.length);
    };

    // Обновление позиций пациентов в очереди
    self.updatePatientPositions = function(){
        for(var i=0; i<self.waitingPatients.length; i++){
            self.waitingPatients[i].updatePosition();
        }
    };

    // Поиск свободного врача
    self.findFreeDoctor = function(){
        for(var i=0; i<self.doctors.length; i++){
            if(!self.doctors[i].isBusy){
                return self.doctors[i];
            }
        }
        return null;
    };

    // Основной шаг симуляции
    self.step = function(){
        self.currentTime += self.timeStep;

        // Добавление новых пациентов по пуассоновскому процессу
        // (упрощенная реализация - проверяем вероятность появления за шаг)
        var lambdaPerStep = (self.arrivalRatePerHour / 60) * self.timeStep;
        if(self.random() < lambdaPerStep){
            self.addPatient();
        }

        // Обслуживание пациентов врачами
        for(var i=0; i<self.doctors.length; i++){
            var doctor = self.doctors[i];

            if(doctor.isBusy){
                // Врач занят - уменьшаем время обслуживания
                doctor.serviceTimeRemaining -= self.timeStep;
                if(doctor.serviceTimeRemaining <= 0){
                    // Завершение приёма
                    doctor.completeService();
                }
                // Обновление времени занятости
                self.stats.totalBusyTime += self.timeStep;
            } else {
                // Врач свободен - ищем пациента
                if(self.waitingPatients.length > 0){
                    var patient = self.waitingPatients.shift();
                    patient.startWaitTime = self.currentTime; // время начала ожидания
                    doctor.startService(patient);
                    self.updatePatientPositions();
                }
            }
        }

        // Обновление статистики
        self.updateStats();

        // Проверка окончания смены
        if(self.currentTime >= self.shiftMinutes){
            self.stop();
        }

        // Вызов callback для обновления UI
        if(self.onStep) self.onStep();
    };

    // Запуск симуляции
    self.start = function(){
        self.isRunning = true;
        self.simulationInterval = setInterval(function(){
            self.step();
        }, 1000); // шаг каждую секунду (реальное время)
    };

    // Остановка симуляции
    self.stop = function(){
        self.isRunning = false;
        if(self.simulationInterval){
            clearInterval(self.simulationInterval);
            self.simulationInterval = null;
        }
    };

    // Сброс симуляции
    self.reset = function(){
        self.stop();

        // Очистка пациентов
        while(self.waitingPatients.length > 0){
            var patient = self.waitingPatients.pop();
            if(patient.graphics && patient.graphics.parent){
                patient.graphics.parent.removeChild(patient.graphics);
            }
        }

        // Очистка завершенных пациентов
        self.completedPatients = [];

        // Сброс врачей
        for(var i=0; i<self.doctors.length; i++){
            self.doctors[i].reset();
        }

        self.currentTime = 0;
        self.resetStats();

        // Вызов callback для обновления UI
        if(self.onReset) self.onReset();
    };

    // Сброс статистики
    self.resetStats = function(){
        self.stats = {
            meanWaitTime: 0,
            p95WaitTime: 0,
            slaShare: 0,
            throughput: 0,
            utilization: 0,
            maxQueueLength: 0,
            totalBusyTime: 0
        };
    };

    // Обновление статистики
    self.updateStats = function(){
        if(self.completedPatients.length === 0) return;

        // Время ожидания пациентов
        var waitTimes = self.completedPatients.map(function(p){ return p.waitTime; });
        var totalWait = waitTimes.reduce(function(a, b){ return a + b; }, 0);

        self.stats.meanWaitTime = totalWait / waitTimes.length;
        self.stats.throughput = self.completedPatients.length;

        // 95-й перцентиль
        waitTimes.sort(function(a, b){ return a - b; });
        var index = Math.floor(waitTimes.length * 0.95);
        self.stats.p95WaitTime = waitTimes[index] || 0;

        // Доля пациентов в SLA
        var slaCount = waitTimes.filter(function(t){ return t <= self.slaMinutes; }).length;
        self.stats.slaShare = slaCount / waitTimes.length;

        // Загрузка врачей
        var totalDoctorTime = self.numDoctors * self.currentTime;
        self.stats.utilization = self.stats.totalBusyTime / totalDoctorTime;
    };

    // Получение статистики
    self.getStats = function(){
        return self.stats;
    };

    // Инициализация при создании
    self.initDoctors();

}

// Профессиональный класс пациента
function QueuePatientProfessional(config){

    var self = this;
    self.id = config.id;
    self.simulation = config.simulation;
    self.arrivalTime = config.arrivalTime;
    self.serviceTime = config.serviceTime;
    self.startWaitTime = config.arrivalTime; // время поступления в очередь
    self.startServiceTime = null; // время начала обслуживания
    self.waitTime = 0; // общее время ожидания

    // Графика - простой круг
    var g = new PIXI.Graphics();
    g.beginFill(0xFF0000); // Красный цвет для пациента
    g.drawCircle(0, 0, 15);
    g.endFill();
    self.graphics = g;

    // Позиция в очереди
    self.updatePosition = function(){
        var index = self.simulation.waitingPatients.indexOf(self);
        if(index !== -1){
            g.x = 100 + index * 60;
            g.y = 400;
        }
    };

    // Начало обслуживания
    self.startService = function(currentTime){
        self.startServiceTime = currentTime;
        self.waitTime = self.startServiceTime - self.arrivalTime;
    };

    // Завершение обслуживания
    self.completeService = function(){
        // Статистика уже собрана в startService
    };

    // Удаление пациента
    self.remove = function(){
        if(g.parent) g.parent.removeChild(g);
    };

    // Инициализация позиции
    self.updatePosition();
}

// Профессиональный класс врача
function QueueDoctorProfessional(config){

    var self = this;
    self.id = config.id;
    self.simulation = config.simulation;
    self.isBusy = false;
    self.currentPatient = null;
    self.serviceTimeRemaining = 0;

    // Графика врача - синий круг
    var g = new PIXI.Graphics();
    g.beginFill(0x0000FF); // Синий цвет для врача
    g.drawCircle(0, 0, 20);
    g.endFill();
    g.x = config.x;
    g.y = config.y;
    self.graphics = g;

    // Контейнер для пациента на приёме
    self.patientContainer = new PIXI.Container();
    self.patientContainer.x = config.x - 50;
    self.patientContainer.y = config.y;
    self.simulation.doctorsContainer.addChild(self.patientContainer);

    // Начало обслуживания пациента
    self.startService = function(patient){
        self.isBusy = true;
        self.currentPatient = patient;
        self.serviceTimeRemaining = patient.serviceTime;

        patient.startService(self.simulation.currentTime);

        // Перемещение пациента к врачу и добавление в контейнер приёма
        // Используем собственную анимацию вместо createjs.Tween
        var targetX = 0;
        var targetY = 0;

        // Простая анимация перемещения
        var startX = patient.graphics.x;
        var startY = patient.graphics.y;
        var duration = 500; // мс
        var startTime = Date.now();

        var animate = function() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);

            patient.graphics.x = startX + (targetX - startX) * progress;
            patient.graphics.y = startY + (targetY - startY) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // После завершения анимации добавляем пациента в контейнер врача
                if(patient.graphics.parent) patient.graphics.parent.removeChild(patient.graphics);
                self.patientContainer.addChild(patient.graphics);
                patient.graphics.x = 0;
                patient.graphics.y = 0;
            }
        };

        animate();
    };

    // Завершение обслуживания
    self.completeService = function(){
        if(self.currentPatient){
            // Добавление пациента в завершенные
            self.simulation.completedPatients.push(self.currentPatient);

            // Удаление пациента из контейнера врача
            if(self.currentPatient.graphics.parent) {
                self.currentPatient.graphics.parent.removeChild(self.currentPatient.graphics);
            }
            self.currentPatient.remove();
            self.currentPatient = null;
        }
        self.isBusy = false;
        self.serviceTimeRemaining = 0;
    };

    // Сброс врача
    self.reset = function(){
        self.isBusy = false;
        self.serviceTimeRemaining = 0;
        if(self.currentPatient){
            // Очистка контейнера пациента
            if(self.currentPatient.graphics.parent) {
                self.currentPatient.graphics.parent.removeChild(self.currentPatient.graphics);
            }
            self.currentPatient.remove();
            self.currentPatient = null;
        }
        // Очистка контейнера приёма
        while(self.patientContainer.children.length > 0){
            self.patientContainer.removeChildAt(0);
        }
    };
}
