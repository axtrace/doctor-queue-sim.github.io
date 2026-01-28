// Скрипт для проверки ошибок JavaScript в консоли
const fs = require('fs');
const path = require('path');

// Проверка синтаксиса основных файлов симуляции
const filesToCheck = [
    'js/sims/QueueSimulation.js',
    'js/sims/QueueUI.js',
    'js/slides/X_Slides_Queue.js'
];

console.log('Проверка синтаксиса файлов симуляции очереди...\n');

let hasErrors = false;

filesToCheck.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Простая проверка - попытка парсинга как JavaScript
        eval('(function(){' + content + '})');
        console.log(`✅ ${filePath} - синтаксис корректен`);
    } catch (error) {
        console.log(`❌ ${filePath} - ошибка синтаксиса: ${error.message}`);
        hasErrors = true;
    }
});

// Проверка существования ассетов
const assetsToCheck = [
    'assets/queue/patient.json',
    'assets/queue/doctor.json',
    'assets/queue/waiting.json'
];

console.log('\nПроверка существования ассетов...\n');

assetsToCheck.forEach(assetPath => {
    if (fs.existsSync(assetPath)) {
        console.log(`✅ ${assetPath} - существует`);
    } else {
        console.log(`❌ ${assetPath} - не существует`);
        hasErrors = true;
    }
});

// Проверка структуры JSON файлов
console.log('\nПроверка структуры JSON файлов...\n');

assetsToCheck.forEach(assetPath => {
    if (fs.existsSync(assetPath)) {
        try {
            const content = fs.readFileSync(assetPath, 'utf8');
            JSON.parse(content);
            console.log(`✅ ${assetPath} - JSON корректен`);
        } catch (error) {
            console.log(`❌ ${assetPath} - ошибка JSON: ${error.message}`);
            hasErrors = true;
        }
    }
});

if (hasErrors) {
    console.log('\n⚠️  Обнаружены ошибки. Необходимо исправить перед тестированием.');
    process.exit(1);
} else {
    console.log('\n✅ Все проверки пройдены успешно!');
    process.exit(0);
}
