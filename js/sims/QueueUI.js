function QueueUI(config){

    var self = this;
    self.id = config.id;
    self.slideshow = config.slideshow;

    // Create DOM
    self.dom = document.createElement("div");
    self.dom.className = "object";
    var dom = self.dom;

    /////////////////////////////////////////
    // BUTTONS for playing //////////////////
    /////////////////////////////////////////

    var playButton = new Button({
        x:172, y:135, text_id:"label_start", size:"short",
        onclick: function(){
            if(slideshow.objects.queueSimulation.isAutoPlaying){
                publish("queue/autoplay/stop");
            }else{
                publish("queue/autoplay/start");
            }
        }
    });
    listen(self, "queue/autoplay/stop",function(){
        playButton.setText("label_start");
    });
    listen(self, "queue/autoplay/start",function(){
        playButton.setText("label_stop");
    });
    dom.appendChild(playButton.dom);

    var stepButton = new Button({
        x:172, y:135+70, text_id:"label_step", message:"queue/step", size:"short"
    });
    dom.appendChild(stepButton.dom);

    var resetButton = new Button({x:172, y:135+70*2, text_id:"label_reset", message:"queue/reset", size:"short"});
    dom.appendChild(resetButton.dom);

    /////////////////////////////////////////
    // PARAMETERS CONTROLS //////////////////
    /////////////////////////////////////////

    var controlsContainer = document.createElement("div");
    controlsContainer.style.position = "absolute";
    controlsContainer.style.left = "300px";
    controlsContainer.style.top = "50px";
    controlsContainer.style.width = "400px";
    dom.appendChild(controlsContainer);

    // Среднее время ожидания
    var waitTimeLabel = _makeLabel("queue_wait_time", {x:0, y:0, w:400});
    var waitTimeSlider = new Slider({
        x:0, y:35, width:380,
        min:1, max:20, step:1,
        message: "queue/wait_time"
    });
    listen(self, "queue/wait_time",function(value){
        var words = Words.get("queue_wait_time");
        words = words.replace(/\[N\]/g, value+"");
        waitTimeLabel.innerHTML = words;
        if(slideshow.objects.queueSimulation){
            slideshow.objects.queueSimulation.avgWaitTime = value;
        }
    });
    controlsContainer.appendChild(waitTimeLabel);
    controlsContainer.appendChild(waitTimeSlider.dom);

    // Среднее время приёма
    var serviceTimeLabel = _makeLabel("queue_service_time", {x:0, y:80, w:400});
    var serviceTimeSlider = new Slider({
        x:0, y:115, width:380,
        min:1, max:10, step:1,
        message: "queue/service_time"
    });
    listen(self, "queue/service_time",function(value){
        var words = Words.get("queue_service_time");
        words = words.replace(/\[N\]/g, value+"");
        serviceTimeLabel.innerHTML = words;
        if(slideshow.objects.queueSimulation){
            slideshow.objects.queueSimulation.avgServiceTime = value;
        }
    });
    controlsContainer.appendChild(serviceTimeLabel);
    controlsContainer.appendChild(serviceTimeSlider.dom);

    // Количество врачей
    var doctorsLabel = _makeLabel("queue_doctors", {x:0, y:160, w:400});
    var doctorsSlider = new Slider({
        x:0, y:195, width:380,
        min:1, max:5, step:1,
        message: "queue/doctors"
    });
    listen(self, "queue/doctors",function(value){
        var words = Words.get("queue_doctors");
        words = words.replace(/\[N\]/g, value+"");
        doctorsLabel.innerHTML = words;
        if(slideshow.objects.queueSimulation){
            slideshow.objects.queueSimulation.doctorsCount = value;
            slideshow.objects.queueSimulation.reset();
            slideshow.objects.queueSimulation.initDoctors();
        }
    });
    controlsContainer.appendChild(doctorsLabel);
    controlsContainer.appendChild(doctorsSlider.dom);

    // Скорость добавления пациентов
    var arrivalRateLabel = _makeLabel("queue_arrival_rate", {x:0, y:240, w:400});
    var arrivalRateSlider = new Slider({
        x:0, y:275, width:380,
        min:0.1, max:1.0, step:0.1,
        message: "queue/arrival_rate"
    });
    listen(self, "queue/arrival_rate",function(value){
        var words = Words.get("queue_arrival_rate");
        words = words.replace(/\[N\]/g, (value*100).toFixed(0)+"%");
        arrivalRateLabel.innerHTML = words;
        if(slideshow.objects.queueSimulation){
            slideshow.objects.queueSimulation.patientArrivalRate = value;
        }
    });
    controlsContainer.appendChild(arrivalRateLabel);
    controlsContainer.appendChild(arrivalRateSlider.dom);

    // Статистика
    var statsContainer = document.createElement("div");
    statsContainer.style.position = "absolute";
    statsContainer.style.left = "300px";
    statsContainer.style.top = "320px";
    statsContainer.style.width = "400px";
    statsContainer.style.fontFamily = "FuturaHandwritten";
    statsContainer.style.fontSize = "16px";
    statsContainer.style.color = "#444";
    dom.appendChild(statsContainer);

    var statsLabel = document.createElement("div");
    statsLabel.innerHTML = Words.get("queue_stats");
    statsContainer.appendChild(statsLabel);

    var statsText = document.createElement("div");
    statsText.id = "queue_stats_text";
    statsText.style.marginTop = "10px";
    statsContainer.appendChild(statsText);

    // Обновление статистики
    self.updateStats = function(){
        if(!slideshow.objects.queueSimulation) return;

        var sim = slideshow.objects.queueSimulation;
        var stats = "Шаг: " + sim.currentStep + "<br>";
        stats += "Пациентов в очереди: " + sim.waitingPatients.length + "<br>";
        stats += "Занято врачей: " + sim.doctors.filter(function(d){ return d.isBusy; }).length + "/" + sim.doctors.length;

        statsText.innerHTML = stats;
    };

    // Подписка на обновления
    listen(self, "queue/step", self.updateStats);
    listen(self, "queue/autoplay/start", self.updateStats);
    listen(self, "queue/autoplay/stop", self.updateStats);
    listen(self, "queue/reset", self.updateStats);

    // Установка значений по умолчанию
    publish("queue/wait_time", [5]);
    publish("queue/service_time", [3]);
    publish("queue/doctors", [2]);
    publish("queue/arrival_rate", [0.3]);

    /////////////////////////////////////////
    // Add & Remove Object //////////////////
    /////////////////////////////////////////

    // Add...
    self.add = function(){
        _add(self);
    };

    // Remove...
    self.remove = function(){
        unlisten(self);
        _remove(self);
    };

}

// Вспомогательная функция для создания меток
function _makeLabel(text_id, config){
    var label = document.createElement("div");
    label.className = "sandbox_pop_label";
    label.style.position = "absolute";
    label.style.left = config.x+"px";
    label.style.top = config.y+"px";
    label.style.width = config.w+"px";
    label.innerHTML = Words.get(text_id);
    return label;
}
