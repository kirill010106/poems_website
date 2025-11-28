/**
 * Модуль "Стих дня"
<<<<<<< HEAD
=======
 * Выбирает детерминированный стих на основе текущей даты
>>>>>>> 697ad7ba95b02dfc42d176acf3384e1b218d8c53
 */

class PoemOfTheDay {
    constructor() {
        this.currentPoem = null;
    }

    /**
     * Получить простой хеш из строки даты
     * @param {string} dateString - строка даты в формате YYYY-MM-DD
     * @returns {number} хеш-число
     */
    getDateHash(dateString) {
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            const char = dateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // конвертируем в 32-битное целое
        }
        return Math.abs(hash);
    }

    /**
     * Получить текущую дату в формате YYYY-MM-DD
     * @returns {string} дата в формате YYYY-MM-DD
     */
    getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Получить стих дня на основе текущей даты
     * @returns {Object|null} объект стиха или null
     */
    getPoemOfTheDay() {
        // Проверяем, загружены ли стихи
        if (!poemsManager || !poemsManager.poems || poemsManager.poems.length === 0) {
            console.error('Стихи еще не загружены');
            return null;
        }

        // Получаем строку текущей даты
        const todayString = this.getTodayString();
        
        // Получаем хеш из даты
        const dateHash = this.getDateHash(todayString);
        
        // Выбираем стих по индексу, основанному на хеше
        const poems = poemsManager.poems;
        const index = dateHash % poems.length;
        
        this.currentPoem = poems[index];
        return this.currentPoem;
    }

    /**
     * Отобразить стих дня в контейнере
     * @param {string} containerId - ID контейнера для отображения
     */
    displayPoemOfTheDay(containerId = 'poem-of-the-day-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Контейнер #${containerId} не найден`);
            return;
        }

        const poem = this.getPoemOfTheDay();
        if (!poem) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <p class="mb-0">Стихи загружаются...</p>
                </div>
            `;
            return;
        }

        // Получаем информацию о поэте
        const poet = poemsManager.getPoetById(poem.authorId);
        const poetName = poet ? poet.name : poem.author;

        // Формируем HTML
        container.innerHTML = `
            <div class="poem-of-day-content">
                <div class="poem-of-day-badge mb-3">
                    <span class="badge bg-accent">✨ Стих дня</span>
                    <span class="text-muted ms-2 small">${this.getFormattedDate()}</span>
                </div>
                
                <h3 class="poem-of-day-title mb-3">${poem.title}</h3>
                
                <div class="poem-of-day-author mb-4">
                    <span class="text-muted">Автор:</span>
                    <a href="/pages/poet-detail.html?id=${poem.authorId}" class="poet-link">
                        ${poetName}
                    </a>
                    ${poem.year ? `<span class="text-muted ms-2">(${poem.year})</span>` : ''}
                </div>

                <div class="poem-of-day-text mb-4">
                    ${this.formatPoemText(poem.text)}
                </div>

                <div class="poem-of-day-footer d-flex flex-wrap gap-2 align-items-center">
                    ${poem.tags ? poem.tags.map(tag => 
                        `<span class="badge tag-badge">${tag}</span>`
                    ).join('') : ''}
                    ${poem.mood ? `<span class="badge mood-badge ms-auto">${this.getMoodEmoji(poem.mood)} ${poem.mood}</span>` : ''}
                </div>

                <div class="poem-of-day-actions mt-4 d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="poemOfTheDayManager.addToFavorites(${poem.id})">
                        <span id="favorite-icon-${poem.id}">
                            ${(typeof favoritesManager !== 'undefined' && favoritesManager.isPoemFavorite(poem.id)) ? '❤️' : '🤍'}
                        </span>
                        В избранное
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="showPoemModal(${poem.id})">
                        Читать полностью →
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Форматировать текст стиха (добавить строфы)
     * @param {string} text - текст стиха
     * @returns {string} отформатированный HTML
     */
    formatPoemText(text) {
        // Разбиваем на строфы (по двойному переносу)
        const stanzas = text.split('\n\n');
        
        // Ограничиваем до первых 3-4 строф для превью
        const previewStanzas = stanzas.slice(0, 3);
        const hasMore = stanzas.length > 3;

        const html = previewStanzas
            .map(stanza => `<p class="poem-stanza">${stanza.replace(/\n/g, '<br>')}</p>`)
            .join('');

        return html + (hasMore ? '<p class="text-muted fst-italic">...</p>' : '');
    }

    /**
     * Получить эмодзи для настроения
     * @param {string} mood - настроение
     * @returns {string} эмодзи
     */
    getMoodEmoji(mood) {
        const moodEmojis = {
            'меланхоличное': '🌙',
            'радостное': '☀️',
            'философское': '🤔',
            'созерцательное': '🤔',
            'романтичное': '💕',
            'патриотичное': '🇷🇺',
            'таинственное': '🌟',
            'ностальгичное': '🕰️',
            'страстное': '🔥',
            'напряженное': '⚡',
            'трагичное': '😢',
            'героическое': '🏆',
            'надеющееся': '✨',
            'беспокойное': '🌊',
            'легкомысленное': '🌈',
            'пророческое': '🔮'
        };
        return moodEmojis[mood] || '📖';
    }

    /**
     * Получить отформатированную дату
     * @returns {string} дата на русском
     */
    getFormattedDate() {
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return today.toLocaleDateString('ru-RU', options);
    }

    /**
     * Добавить/удалить стих из избранного
     * @param {number} poemId - ID стиха
     */
    addToFavorites(poemId) {
        if (typeof favoritesManager === 'undefined' || !favoritesManager) {
            alert('Система избранного недоступна');
            return;
        }

        const isFavorite = favoritesManager.isPoemFavorite(poemId);
        
        if (isFavorite) {
            favoritesManager.removePoem(poemId);
        } else {
            favoritesManager.addPoem(poemId);
        }

        // Обновляем иконку
        const icon = document.getElementById(`favorite-icon-${poemId}`);
        if (icon && favoritesManager) {
            icon.textContent = favoritesManager.isPoemFavorite(poemId) ? '❤️' : '🤍';
        }
    }
}

// Создаем глобальный экземпляр
const poemOfTheDayManager = new PoemOfTheDay();

// Инициализация при загрузке данных
document.addEventListener('poemsDataLoaded', () => {
    poemOfTheDayManager.displayPoemOfTheDay();
});

// Слушаем изменения в избранном
document.addEventListener('favoritesChanged', () => {
    // Обновляем иконку избранного, если стих дня отображен
    if (poemOfTheDayManager.currentPoem && typeof favoritesManager !== 'undefined') {
        const icon = document.getElementById(`favorite-icon-${poemOfTheDayManager.currentPoem.id}`);
        if (icon) {
            icon.textContent = favoritesManager.isPoemFavorite(poemOfTheDayManager.currentPoem.id) ? '❤️' : '🤍';
        }
    }
});
