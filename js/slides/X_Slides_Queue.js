// Слайды для симуляции очереди к врачам
var SLIDES_QUEUE = [

    // Слайд 0: Введение в симуляцию очереди
    {
        id: "queue_intro",
        objects: [
            {
                type: "TextBox",
                x: 480, y: 270, width: 800, align: "center",
                text_id: "queue_intro_text"
            },
            {
                type: "Button",
                x: 480, y: 450, text_id: "queue_intro_button",
                message: "slideshow/next"
            }
        ]
    },

    // Слайд 1: Основная симуляция с управлением
    {
        id: "queue_simulation",
        objects: [
            {
                type: "QueueSimulation",
                id: "queueSimulation",
                x: 240, y: 20
            },
            {
                type: "QueueUI",
                id: "queueUI",
                x: 0, y: 0
            },
            {
                type: "TextBox",
                x: 480, y: 450, width: 800, align: "center",
                text_id: "queue_simulation_text"
            },
            {
                type: "Button",
                x: 480, y: 500, text_id: "queue_next_button",
                message: "slideshow/next"
            }
        ]
    },

    // Слайд 2: Анализ результатов
    {
        id: "queue_analysis",
        objects: [
            {
                type: "TextBox",
                x: 480, y: 100, width: 800, align: "center",
                text_id: "queue_analysis_text"
            },
            {
                type: "ImageBox",
                x: 480, y: 300, width: 400, height: 200,
                image: "assets/queue/analysis.png"
            },
            {
                type: "Button",
                x: 480, y: 500, text_id: "queue_finish_button",
                message: "slideshow/next"
            }
        ]
    }

];

// Добавление слайдов в общий массив
if(typeof SLIDES !== 'undefined'){
    // Вставляем слайды очереди после существующих слайдов
    SLIDES = SLIDES.concat(SLIDES_QUEUE);
}
