/**
 * Класс Doctor - представляет врача в системе
 */
class Doctor {
    constructor(id, capacity = 1) {
        this.id = id;
        this.capacity = capacity; // максимальное количество пациентов одновременно
        this.currentPatients = []; // список текущих пациентов
        this.totalBusyTime = 0; // Общее время занятости
        this.lastBusyStartTime = null; // Время начала последнего периода занятости
        this.patientsServed = 0; // Количество обслуженных пациентов
    }

    /**
     * Начать обслуживание пациента
     */
    startService(patient, currentTime) {
        this.currentPatients.push(patient);
        // Начинаем отсчёт занятости при первом пациенте
        if (this.currentPatients.length === 1) {
            this.lastBusyStartTime = currentTime;
        }
    }

    /**
     * Завершить обслуживание конкретного пациента
     */
    endService(patientId, currentTime) {
        const index = this.currentPatients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            this.currentPatients.splice(index, 1);
            this.patientsServed++;
        }

        // Если все пациенты ушли — фиксируем время занятости
        if (this.currentPatients.length === 0 && this.lastBusyStartTime !== null) {
            this.totalBusyTime += (currentTime - this.lastBusyStartTime);
            this.lastBusyStartTime = null;
        }
    }

    /**
     * Получить коэффициент загрузки врача
     */
    getUtilization(totalTime) {
        if (totalTime === 0) return 0;

        let busyTime = this.totalBusyTime;

        // Если врач сейчас занят, добавляем текущий период
        if (this.currentPatients.length > 0 && this.lastBusyStartTime !== null) {
            busyTime += (totalTime - this.lastBusyStartTime);
        }

        return (busyTime / totalTime) * 100;
    }

    /**
     * Проверить, есть ли свободное место у врача
     */
    isAvailable() {
        return this.currentPatients.length < this.capacity;
    }

    /**
     * Проверить, занят ли врач (есть хотя бы один пациент)
     */
    get isBusy() {
        return this.currentPatients.length > 0;
    }

    /**
     * Получить первого пациента (для обратной совместимости)
     */
    get currentPatient() {
        return this.currentPatients[0] || null;
    }

    /**
     * Сбросить статистику врача
     */
    reset() {
        this.currentPatients = [];
        this.totalBusyTime = 0;
        this.lastBusyStartTime = null;
        this.patientsServed = 0;
    }
}
