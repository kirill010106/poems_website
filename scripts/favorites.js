/**
 * Менеджер избранного (favorites)
 * Использует localStorage для хранения избранных стихов и поэтов
 */

class FavoritesManager {
    constructor() {
        this.storageKey = 'poetryFavorites';
        this.favorites = this.loadFromStorage();
    }

    /**
     * Загрузка избранного из localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { poems: [], poets: [] };
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
            return { poems: [], poets: [] };
        }
    }

    /**
     * Сохранение в localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            this.dispatchChangeEvent();
        } catch (error) {
            console.error('Ошибка сохранения избранного:', error);
        }
    }

    /**
     * Диспатчим событие изменения избранного
     */
    dispatchChangeEvent() {
        const event = new CustomEvent('favoritesChanged', {
            detail: {
                poems: this.favorites.poems.length,
                poets: this.favorites.poets.length
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Добавить стихотворение в избранное
     */
    addPoem(poemId) {
        const id = parseInt(poemId);
        if (!this.favorites.poems.includes(id)) {
            this.favorites.poems.push(id);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Удалить стихотворение из избранного
     */
    removePoem(poemId) {
        const id = parseInt(poemId);
        const index = this.favorites.poems.indexOf(id);
        if (index > -1) {
            this.favorites.poems.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Переключить статус избранного для стихотворения
     */
    togglePoem(poemId) {
        if (this.isPoemFavorite(poemId)) {
            this.removePoem(poemId);
            return false;
        } else {
            this.addPoem(poemId);
            return true;
        }
    }

    /**
     * Проверить, является ли стихотворение избранным
     */
    isPoemFavorite(poemId) {
        return this.favorites.poems.includes(parseInt(poemId));
    }

    /**
     * Получить все избранные стихотворения
     */
    getFavoritePoems() {
        return this.favorites.poems;
    }

    /**
     * Получить количество избранных стихотворений
     */
    getPoemsCount() {
        return this.favorites.poems.length;
    }

    /**
     * Добавить поэта в избранное
     */
    addPoet(poetId) {
        if (!this.favorites.poets.includes(poetId)) {
            this.favorites.poets.push(poetId);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Удалить поэта из избранного
     */
    removePoet(poetId) {
        const index = this.favorites.poets.indexOf(poetId);
        if (index > -1) {
            this.favorites.poets.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Переключить статус избранного для поэта
     */
    togglePoet(poetId) {
        if (this.isPoetFavorite(poetId)) {
            this.removePoet(poetId);
            return false;
        } else {
            this.addPoet(poetId);
            return true;
        }
    }

    /**
     * Проверить, является ли поэт избранным
     */
    isPoetFavorite(poetId) {
        return this.favorites.poets.includes(poetId);
    }

    /**
     * Получить всех избранных поэтов
     */
    getFavoritePoets() {
        return this.favorites.poets;
    }

    /**
     * Получить количество избранных поэтов
     */
    getPoetsCount() {
        return this.favorites.poets.length;
    }

    /**
     * Получить общее количество избранного
     */
    getTotalCount() {
        return this.favorites.poems.length + this.favorites.poets.length;
    }

    /**
     * Очистить все избранное
     */
    clearAll() {
        this.favorites = { poems: [], poets: [] };
        this.saveToStorage();
    }

    /**
     * Очистить избранные стихотворения
     */
    clearPoems() {
        this.favorites.poems = [];
        this.saveToStorage();
    }

    /**
     * Очистить избранных поэтов
     */
    clearPoets() {
        this.favorites.poets = [];
        this.saveToStorage();
    }

    /**
     * Экспортировать избранное в JSON
     */
    exportToJSON() {
        return JSON.stringify(this.favorites, null, 2);
    }

    /**
     * Импортировать избранное из JSON
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.poems && data.poets) {
                this.favorites = data;
                this.saveToStorage();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка импорта:', error);
            return false;
        }
    }
}

// Создаем глобальный экземпляр
const favoritesManager = new FavoritesManager();

// Обновляем счетчик в header при изменении избранного
document.addEventListener('favoritesChanged', (e) => {
    updateFavoritesCounter();
});

// Функция для обновления счетчика в header (глобальная, вызывается из load-components.js)
function updateFavoritesCounter() {
    const counter = document.getElementById('favoritesCounter');
    if (counter) {
        const count = favoritesManager.getTotalCount();
        counter.textContent = count;
        counter.style.display = count > 0 ? 'inline' : 'none';
    }
}

console.log('✅ FavoritesManager загружен');
