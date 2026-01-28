// Используем существующие изображения персонажей
var PATIENT_IMAGES = [
    "peeps/peep/aimee.png",
    "peeps/peep/alex-d.png",
    "peeps/peep/andy.png",
    "peeps/peep/chad.png",
    "peeps/peep/dylan-f.png",
    "peeps/peep/jared-c.png",
    "peeps/peep/josef.png",
    "peeps/peep/kate.png",
    "peeps/peep/ljt.png",
    "peeps/peep/luke.png",
    "peeps/peep/mark.png",
    "peeps/peep/matt.png",
    "peeps/peep/michael_duke.png",
    "peeps/peep/michael_huff.png",
    "peeps/peep/natalie.png",
    "peeps/peep/noel.png",
    "peeps/peep/pablo.png",
    "peeps/peep/phil.png",
    "peeps/peep/sean-r.png",
    "peeps/peep/serena.png",
    "peeps/peep/toph-t.png",
    "peeps/peep/travis.png",
    "peeps/peep/yu-han.png"
];

// Добавляем изображения в манифест загрузки
PATIENT_IMAGES.forEach(function(imagePath) {
    var key = imagePath.replace(/\//g, '_').replace('.png', '');
    Loader.addToManifest(Loader.manifest, {
        [key]: imagePath
    });
});

function QueueSimulation(config){

    var self = this;
    self.id = config.id;

    // APP
    var app = new PIXI.Application(800, 500, {transparent:true, resolution:2});
    self.dom = app.view;

    // DOM
    self.dom.className = "object";
    self.dom.style.width = 800;
    self.dom.style.height = 500;
    self.dom.style.left = config.x+"px";
    self.dom.style.top = config.y+"px";

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

    // Инициализация врачей
    self.initDoctors = function(){
        for(var i=0; i<self.doctorsCount; i++){
            var doctor = new QueueDoctor({
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
        var patient = new QueuePatient({
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
    };

    // Автоплей
    var _autoPlayInterval;
    self.startAutoPlay = function(){
        self.isAutoPlaying = true;
        _autoPlayInterval = setInterval(function(){
            self.step();
        }, 1000); // шаг каждую секунду
    };

    self.stopAutoPlay = function(){
        self.isAutoPlaying = false;
        if(_autoPlayInterval){
            clearInterval(_autoPlayInterval);
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
    };

    // Инициализация
    self.initDoctors();

    // События
    listen(self, "queue/autoplay/start", self.startAutoPlay);
    listen(self, "queue/autoplay/stop", self.stopAutoPlay);
    listen(self, "queue/step", self.step);
    listen(self, "queue/reset", self.reset);

    // Добавление и удаление
    self.add = function(){
        _add(self);
    };

    self.remove = function(){
        self.stopAutoPlay();
        for(var i=0; i<self.doctors.length; i++) unlisten(self.doctors[i]);
        for(var i=0; i<self.waitingPatients.length; i++) unlisten(self.waitingPatients[i]);
        unlisten(self);
        app.destroy();
        _remove(self);
    };

}

// Класс пациента
function QueuePatient(config){

    var self = this;
    self.id = config.id;
    self.simulation = config.simulation;
    self.waitingTime = 0;

    // Графика - случайное изображение пациента
    var randomImageIndex = Math.floor(Math.random() * PATIENT_IMAGES.length);
    var imageKey = PATIENT_IMAGES[randomImageIndex].replace(/\//g, '_').replace('.png', '');
    var g = _makeSprite(imageKey, {width: 60});
    g.anchor.x = 0.5;
    g.anchor.y = 0.5;
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

}

// Класс врача
function QueueDoctor(config){

    var self = this;
    self.id = config.id;
    self.simulation = config.simulation;
    self.isBusy = false;
    self.currentPatient = null;
    self.serviceTimeRemaining = 0;

    // Графика врача - используем другое изображение
    var doctorImageIndex = Math.floor(Math.random() * PATIENT_IMAGES.length);
    var doctorImageKey = PATIENT_IMAGES[doctorImageIndex].replace(/\//g, '_').replace('.png', '');
    var g = _makeSprite(doctorImageKey, {width: 80});
    g.anchor.x = 0.5;
    g.anchor.y = 0.5;
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
        Tween_get(patient.graphics).to({
            x: self.graphics.x - 50,
            y: self.graphics.y
        }, 500);
    };

    // Завершение обслуживания
    self.completeService = function(){
        if(self.currentPatient){
            // Удаление пациента из массива ожидания
            var patientIndex = self.simulation.waitingPatients.indexOf(self.currentPatient);
            if(patientIndex !== -1){
                self.simulation.waitingPatients.splice(patientIndex, 1);
            }
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
