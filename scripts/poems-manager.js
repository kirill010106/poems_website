/**
 * Менеджер для работы с базой стихотворений
 */

// Определяем базовый путь для GitHub Pages
function getBasePath() {
    const path = window.location.pathname;
    // Если мы в подпапке pages/, возвращаемся на уровень выше
    if (path.includes('/pages/')) {
        return '../';
    }
    // Для корневой страницы
    return './';
}

class PoemsManager {
    constructor() {
        this.poems = [];
        this.poets = [];
        this.facts = [];
        this.loaded = false;
        this.basePath = getBasePath();
    }

    /**
     * Загрузка всех данных из JSON файлов
     */
    async loadData() {
        if (this.loaded) return;

        try {
            // Загружаем стихи
            const poemsResponse = await fetch(this.basePath + 'data/poems.json');
            const poemsData = await poemsResponse.json();
            this.poems = poemsData.poems;

            // Загружаем поэтов
            const poetsResponse = await fetch(this.basePath + 'data/poets.json');
            const poetsData = await poetsResponse.json();
            this.poets = poetsData.poets;
            
            // Исправляем пути к изображениям для GitHub Pages
            this.poets = this.poets.map(poet => ({
                ...poet,
                image: poet.image.startsWith('/') ? this.basePath + poet.image.substring(1) : poet.image
            }));

            // Загружаем факты
            const factsResponse = await fetch(this.basePath + 'data/facts.json');
            const factsData = await factsResponse.json();
            this.facts = factsData.facts;

            this.loaded = true;
            console.log('✅ Данные загружены:', {
                poems: this.poems.length,
                poets: this.poets.length,
                facts: this.facts.length
            });
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
        }
    }

    /**
     * Получить все стихи
     */
    getAllPoems() {
        return this.poems;
    }

    /**
     * Получить стихотворение по ID
     */
    getPoemById(id) {
        return this.poems.find(poem => poem.id === parseInt(id));
    }

    /**
     * Получить стихи по автору
     */
    getPoemsByAuthor(authorId) {
        return this.poems.filter(poem => poem.authorId === authorId);
    }

    /**
     * Получить случайное стихотворение
     */
    getRandomPoem() {
        const randomIndex = Math.floor(Math.random() * this.poems.length);
        return this.poems[randomIndex];
    }

    /**
     * Поиск стихов по тексту
     */
    searchPoems(query) {
        if (!query || query.trim() === '') {
            return this.poems;
        }

        const lowerQuery = query.toLowerCase();
        return this.poems.filter(poem => {
            return poem.title.toLowerCase().includes(lowerQuery) ||
                   poem.author.toLowerCase().includes(lowerQuery) ||
                   poem.text.toLowerCase().includes(lowerQuery) ||
                   poem.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        });
    }

    /**
     * Фильтрация стихов по тегам
     */
    filterByTags(tags) {
        if (!tags || tags.length === 0) {
            return this.poems;
        }

        return this.poems.filter(poem => {
            return tags.some(tag => poem.tags.includes(tag));
        });
    }

    /**
     * Фильтрация по настроению
     */
    filterByMood(mood) {
        if (!mood) return this.poems;
        return this.poems.filter(poem => poem.mood === mood);
    }

    /**
     * Получить все уникальные теги
     */
    getAllTags() {
        const tagsSet = new Set();
        this.poems.forEach(poem => {
            poem.tags.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }

    /**
     * Получить все уникальные настроения
     */
    getAllMoods() {
        const moodsSet = new Set();
        this.poems.forEach(poem => {
            if (poem.mood) moodsSet.add(poem.mood);
        });
        return Array.from(moodsSet).sort();
    }

    /**
     * Получить всех поэтов
     */
    getAllPoets() {
        return this.poets;
    }

    /**
     * Получить поэта по ID
     */
    getPoetById(id) {
        return this.poets.find(poet => poet.id === id);
    }

    /**
     * Получить поэта по стихотворению
     */
    getPoetByPoem(poemId) {
        const poem = this.getPoemById(poemId);
        if (!poem) return null;
        return this.getPoetById(poem.authorId);
    }

    /**
     * Получить все факты
     */
    getAllFacts() {
        return this.facts;
    }

    /**
     * Получить случайный факт
     */
    getRandomFact() {
        const randomIndex = Math.floor(Math.random() * this.facts.length);
        return this.facts[randomIndex];
    }

    /**
     * Получить факты по категории
     */
    getFactsByCategory(category) {
        return this.facts.filter(fact => fact.category === category);
    }

    /**
     * Получить статистику по автору
     */
    getAuthorStats(authorId) {
        const poems = this.getPoemsByAuthor(authorId);
        const poet = this.getPoetById(authorId);
        
        const tags = {};
        const moods = {};
        
        poems.forEach(poem => {
            poem.tags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
            if (poem.mood) {
                moods[poem.mood] = (moods[poem.mood] || 0) + 1;
            }
        });

        return {
            poet: poet,
            totalPoems: poems.length,
            tags: tags,
            moods: moods,
            averageYear: Math.round(
                poems.reduce((sum, p) => sum + (p.year || 0), 0) / poems.length
            )
        };
    }

    /**
     * Сортировка стихов
     */
    sortPoems(poems, sortBy = 'title') {
        const sorted = [...poems];
        
        switch(sortBy) {
            case 'title':
                return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
            case 'author':
                return sorted.sort((a, b) => a.author.localeCompare(b.author, 'ru'));
            case 'year':
                return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
            case 'yearDesc':
                return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
            default:
                return sorted;
        }
    }
}

// Создаем глобальный экземпляр
const poemsManager = new PoemsManager();

// Автоматически загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await poemsManager.loadData();
    
    // Диспатчим событие, что данные загружены
    const event = new CustomEvent('poemsDataLoaded', { 
        detail: { 
            poems: poemsManager.getAllPoems().length,
            poets: poemsManager.getAllPoets().length,
            facts: poemsManager.getAllFacts().length
        } 
    });
    document.dispatchEvent(event);
});
