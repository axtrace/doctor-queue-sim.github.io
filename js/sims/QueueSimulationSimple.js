// Упрощенная версия симуляции очереди для standalone использования
function QueueSimulationSimple(config){

    var self = this;

    // APP
    var app = config.app || new PIXI.Application(800, 500, {backgroundColor: 0xFFFFFF});
    self.app = app;

    // Контейнеры
    self.waitingContainer = new PIXI.Container();
    self.doctorsContainer = new PIXI.Container();
    app.stage.addChild(self.waitingContainer);
    app.stage.addChild(self.doctorsContainer);

    // Параметры симуляции
    self.avgWaitTime = 5; // среднее время ожидания (шаги)
    self.avgServiceTime = 3; // среднее время приёма (шаги)
    self.doctorsCount = 2; // количество врачей
    self.patientArrivalRate = 0.3; // вероятность появления пациента за шаг

    // Состояния
    self.waitingPatients = [];
    self.doctors = [];
    self.currentStep = 0;
    self.isAutoPlaying = false;
    self.autoPlayInterval = null;

    // Инициализация
    self.init = function(app){
        if(app) {
            self.app = app;
            app.stage.addChild(self.waitingContainer);
            app.stage.addChild(self.doctorsContainer);
        }
        self.initDoctors();
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

        for(var i=0; i<self.doctorsCount; i++){
            var doctor = new QueueDoctorSimple({
                id: i,
                x: 600,
                y: 100 + i * 120,
                simulation: self
            });
            self.doctorsContainer.addChild(doctor.graphics);
            self.doctors.push(doctor);
        }
    };

    // Добавление пациента в очередь
    self.addPatient = function(){
        var patient = new QueuePatientSimple({
            id: self.waitingPatients.length,
            simulation: self
        });
        self.waitingContainer.addChild(patient.graphics);
        self.waitingPatients.push(patient);
        patient.updatePosition();
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
        self.currentStep++;

        // Добавление нового пациента с вероятностью
        if(Math.random() < self.patientArrivalRate){
            self.addPatient();
        }

        // Обслуживание пациентов врачами
        for(var i=0; i<self.doctors.length; i++){
            var doctor = self.doctors[i];

            if(doctor.isBusy){
                // Врач занят - уменьшаем время обслуживания
                doctor.serviceTimeRemaining--;
                if(doctor.serviceTimeRemaining <= 0){
                    // Завершение приёма
                    doctor.completeService();
                }
            } else {
                // Врач свободен - ищем пациента
                if(self.waitingPatients.length > 0){
                    var patient = self.waitingPatients.shift();
                    doctor.startService(patient);
                    self.updatePatientPositions();
                }
            }
        }

        // Обновление времени ожидания пациентов
        for(var i=0; i<self.waitingPatients.length; i++){
            self.waitingPatients[i].waitingTime++;
        }

        // Вызов callback для обновления UI
        if(self.onStep) self.onStep();
    };

    // Автоплей
    self.startAutoPlay = function(){
        self.isAutoPlaying = true;
        self.autoPlayInterval = setInterval(function(){
            self.step();
        }, 1000); // шаг каждую секунду
    };

    self.stopAutoPlay = function(){
        self.isAutoPlaying = false;
        if(self.autoPlayInterval){
            clearInterval(self.autoPlayInterval);
            self.autoPlayInterval = null;
        }
    };

    // Сброс симуляции
    self.reset = function(){
        self.stopAutoPlay();

        // Очистка пациентов
        while(self.waitingPatients.length > 0){
            var patient = self.waitingPatients.pop();
            if(patient.graphics && patient.graphics.parent){
                patient.graphics.parent.removeChild(patient.graphics);
            }
        }

        // Сброс врачей
        for(var i=0; i<self.doctors.length; i++){
            self.doctors[i].reset();
        }

        self.currentStep = 0;

        // Вызов callback для обновления UI
        if(self.onReset) self.onReset();
    };

    // Получение статистики
    self.getStats = function(){
        var busyDoctors = self.doctors.filter(function(d){ return d.isBusy; }).length;
        return {
            step: self.currentStep,
            waitingPatients: self.waitingPatients.length,
            busyDoctors: busyDoctors,
            totalDoctors: self.doctors.length
        };
    };

    // Инициализация при создании
    self.initDoctors();

}

// Упрощенный класс пациента
function QueuePatientSimple(config){

    var self = this;
    self.id = config.id;
    self.simulation = config.simulation;
    self.waitingTime = 0;

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

    // Удаление пациента
    self.remove = function(){
        if(g.parent) g.parent.removeChild(g);
    };

    // Инициализация позиции
    self.updatePosition();
}

// Упрощенный класс врача
function QueueDoctorSimple(config){

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

    // Начало обслуживания пациента
    self.startService = function(patient){
        self.isBusy = true;
        self.currentPatient = patient;
        self.serviceTimeRemaining = Math.max(1, Math.round(
            self.simulation.avgServiceTime * (0.5 + Math.random())
        ));

        // Перемещение пациента к врачу
        createjs.Tween.get(patient.graphics).to({
            x: self.graphics.x - 50,
            y: self.graphics.y
        }, 500);
    };

    // Завершение обслуживания
    self.completeService = function(){
        if(self.currentPatient){
            // Удаление пациента
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
            self.currentPatient.remove();
            self.currentPatient = null;
        }
    };
}
