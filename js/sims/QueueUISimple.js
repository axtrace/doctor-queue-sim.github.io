// Упрощенный интерфейс управления для standalone использования
function QueueUISimple(config){

    var self = this;
    self.simulation = config.simulation;

    // Create DOM
    self.dom = document.createElement("div");
    self.dom.className = "queue-ui-simple";
    self.dom.style.padding = "20px";
    self.dom.style.background = "#f8f9fa";
    self.dom.style.borderRadius = "10px";
    self.dom.style.marginTop = "20px";

    /////////////////////////////////////////
    // КНОПКИ УПРАВЛЕНИЯ ////////////////////
    /////////////////////////////////////////

    var buttonsContainer = document.createElement("div");
    buttonsContainer.style.marginBottom = "20px";
    self.dom.appendChild(buttonsContainer);

    // Кнопка старт/стоп
    var playButton = document.createElement("button");
    playButton.textContent = "Старт";
    playButton.style.padding = "10px 20px";
    playButton.style.marginRight = "10px";
    playButton.style.fontSize = "16px";
    playButton.style.cursor = "pointer";
    playButton.onclick = function(){
        if(self.simulation.isAutoPlaying){
            self.simulation.stopAutoPlay();
            playButton.textContent = "Старт";
        } else {
            self.simulation.startAutoPlay();
            playButton.textContent = "Стоп";
        }
    };
    buttonsContainer.appendChild(playButton);

    // Кнопка шаг
    var stepButton = document.createElement("button");
    stepButton.textContent = "Шаг";
    stepButton.style.padding = "10px 20px";
    stepButton.style.marginRight = "10px";
    stepButton.style.fontSize = "16px";
    stepButton.style.cursor = "pointer";
    stepButton.onclick = function(){
        self.simulation.step();
    };
    buttonsContainer.appendChild(stepButton);

    // Кнопка сброс
    var resetButton = document.createElement("button");
    resetButton.textContent = "Сброс";
    resetButton.style.padding = "10px 20px";
    resetButton.style.fontSize = "16px";
    resetButton.style.cursor = "pointer";
    resetButton.onclick = function(){
        self.simulation.reset();
        playButton.textContent = "Старт";
    };
    buttonsContainer.appendChild(resetButton);

    /////////////////////////////////////////
    // ПАРАМЕТРЫ УПРАВЛЕНИЯ /////////////////
    /////////////////////////////////////////

    var controlsContainer = document.createElement("div");
    controlsContainer.style.marginBottom = "20px";
    self.dom.appendChild(controlsContainer);

    // Среднее время ожидания
    var waitTimeControl = createSliderControl(
        "Среднее время ожидания:",
        self.simulation.avgWaitTime,
        1,
        20,
        1,
        function(value){
            self.simulation.avgWaitTime = value;
        }
    );
    controlsContainer.appendChild(waitTimeControl);

    // Среднее время приёма
    var serviceTimeControl = createSliderControl(
        "Среднее время приёма:",
        self.simulation.avgServiceTime,
        1,
        10,
        1,
        function(value){
            self.simulation.avgServiceTime = value;
        }
    );
    controlsContainer.appendChild(serviceTimeControl);

    // Количество врачей
    var doctorsControl = createSliderControl(
        "Количество врачей:",
        self.simulation.doctorsCount,
        1,
        5,
        1,
        function(value){
            self.simulation.doctorsCount = value;
            self.simulation.reset();
            self.simulation.initDoctors();
        }
    );
    controlsContainer.appendChild(doctorsControl);

    // Интервал добавления пациентов
    var arrivalIntervalControl = createSliderControl(
        "Интервал появления пациентов (шаги):",
        self.simulation.patientArrivalInterval,
        1,
        10,
        1,
        function(value){
            self.simulation.patientArrivalInterval = value;
        }
    );
    controlsContainer.appendChild(arrivalIntervalControl);

    /////////////////////////////////////////
    // СТАТИСТИКА ///////////////////////////
    /////////////////////////////////////////

    var statsContainer = document.createElement("div");
    statsContainer.style.padding = "15px";
    statsContainer.style.background = "#e9ecef";
    statsContainer.style.borderRadius = "5px";
    statsContainer.style.fontFamily = "Arial, sans-serif";
    statsContainer.style.fontSize = "14px";
    self.dom.appendChild(statsContainer);

    var statsTitle = document.createElement("div");
    statsTitle.textContent = "Статистика:";
    statsTitle.style.fontWeight = "bold";
    statsTitle.style.marginBottom = "10px";
    statsContainer.appendChild(statsTitle);

    var statsText = document.createElement("div");
    statsText.id = "queue-stats-text";
    statsContainer.appendChild(statsText);

    // Обновление статистики
    self.updateStats = function(){
        var stats = self.simulation.getStats();
        statsText.innerHTML =
            "Шаг: " + stats.step + "<br>" +
            "Пациентов в очереди: " + stats.waitingPatients + "<br>" +
            "Занято врачей: " + stats.busyDoctors + "/" + stats.totalDoctors;
    };

    // Подписка на события симуляции
    self.simulation.onStep = self.updateStats;
    self.simulation.onReset = self.updateStats;

    // Инициализация статистики
    self.updateStats();

    /////////////////////////////////////////
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ /////////////
    /////////////////////////////////////////

    function createSliderControl(label, defaultValue, min, max, step, onChange, formatValue){
        var container = document.createElement("div");
        container.style.marginBottom = "15px";

        var labelElem = document.createElement("div");
        labelElem.textContent = label;
        labelElem.style.marginBottom = "5px";
        labelElem.style.fontWeight = "bold";
        container.appendChild(labelElem);

        var sliderContainer = document.createElement("div");
        sliderContainer.style.display = "flex";
        sliderContainer.style.alignItems = "center";
        container.appendChild(sliderContainer);

        var slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = defaultValue;
        slider.style.flex = "1";
        slider.style.marginRight = "10px";
        sliderContainer.appendChild(slider);

        var valueDisplay = document.createElement("span");
        valueDisplay.style.minWidth = "50px";
        valueDisplay.style.textAlign = "center";
        valueDisplay.style.fontWeight = "bold";
        valueDisplay.textContent = formatValue ? formatValue(defaultValue) : defaultValue;
        sliderContainer.appendChild(valueDisplay);

        slider.oninput = function(){
            var value = parseFloat(this.value);
            valueDisplay.textContent = formatValue ? formatValue(value) : value;
            onChange(value);
        };

        return container;
    }

}
