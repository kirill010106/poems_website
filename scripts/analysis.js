/**
 * Скрипт для страницы анализа поэзии
 * Управляет фильтрацией по настроениям, тегам, эпохам, статистикой и фактами
 */

let allPoems = [];
let allPoets = [];
let allFacts = [];

// Описания настроений
const moodDescriptions = {
    'меланхоличное': {
        title: 'Меланхолия',
        description: 'Стихи, наполненные грустью, тоской и раздумьями о бренности бытия'
    },
    'радостное': {
        title: 'Радость',
        description: 'Светлые, жизнеутверждающие произведения, воспевающие счастье и красоту'
    },
    'созерцательное': {
        title: 'Философия',
        description: 'Глубокие размышления о смысле жизни, природе человека и мироздании'
    },
    'романтичное': {
        title: 'Романтика',
        description: 'Стихи о любви, страсти и нежных чувствах'
    },
    'ностальгичное': {
        title: 'Ностальгия',
        description: 'Произведения о воспоминаниях, прошлом и ушедших временах'
    },
    'таинственное': {
        title: 'Мистика',
        description: 'Таинственные, загадочные стихи с элементами мистики и символизма'
    },
    'беспокойное': {
        title: 'Беспокойство',
        description: 'Стихи, передающие тревогу, волнение и внутреннее напряжение'
    },
    'легкомысленное': {
        title: 'Легкомыслие',
        description: 'Беззаботные, игривые произведения с лёгким настроением'
    },
    'пророческое': {
        title: 'Пророчество',
        description: 'Провидческие стихи о будущем, предупреждения и предсказания'
    },
    'страстное': {
        title: 'Страсть',
        description: 'Эмоционально насыщенные произведения о сильных чувствах'
    },
    'напряженное': {
        title: 'Напряжение',
        description: 'Стихи, создающие атмосферу ожидания и внутреннего конфликта'
    },
    'трагичное': {
        title: 'Трагедия',
        description: 'Произведения о горе, потерях и драматических событиях'
    },
    'героическое': {
        title: 'Героизм',
        description: 'Стихи о подвигах, мужестве и величии человеческого духа'
    },
    'надеющееся': {
        title: 'Надежда',
        description: 'Оптимистичные произведения, вселяющие веру в лучшее'
    }
};

// Описания эпох
const eraDescriptions = {
    '1800-1850': {
        title: 'Золотой век русской поэзии (1800-1850)',
        description: 'Эпоха Пушкина, Лермонтова, романтизма и становления русской классики'
    },
    '1850-1900': {
        title: 'Эпоха реализма (1850-1900)',
        description: 'Время Некрасова, Тютчева, развития реалистической поэзии'
    },
    '1900-1920': {
        title: 'Серебряный век (1900-1920)',
        description: 'Расцвет символизма, акмеизма, футуризма. Блок, Ахматова, Маяковский'
    },
    '1920-1950': {
        title: 'Советский период (1920-1950)',
        description: 'Эпоха социалистического реализма, военная лирика'
    },
    '1950-2000': {
        title: 'Современная поэзия (1950-2000)',
        description: 'Оттепель, шестидесятники, авторская песня, постмодернизм'
    }
};

// Названия категорий фактов
const categoryNames = {
    'history': 'История',
    'creative': 'Творчество',
    'biography': 'Биография',
    'poet': 'О поэтах',
    'literature': 'О литературе',
    'interesting': 'Интересное',
    'talent': 'Таланты'
};

/**
 * Загрузка данных при готовности
 */
document.addEventListener('poemsDataLoaded', async () => {
    allPoems = poemsManager.getAllPoems();
    allPoets = poemsManager.getAllPoets();
    
    // Загрузка фактов
    try {
        const response = await fetch('../data/facts.json');
        const data = await response.json();
        allFacts = data.facts || [];
        console.log('Загружено фактов:', allFacts.length);
    } catch (error) {
        console.error('Ошибка загрузки фактов:', error);
        allFacts = [];
    }

    initializeAnalysis();
});

/**
 * Инициализация анализа
 */
function initializeAnalysis() {
    createTagCloud();
    createPoetStats();
    displayRandomFacts();
    attachEventListeners();
}

/**
 * Подключение обработчиков событий
 */
function attachEventListeners() {
    // Обработчики настроений
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.dataset.mood;
            filterByMood(mood);
            
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Обработчики эпох
    document.querySelectorAll('.era-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const era = this.dataset.era;
            filterByEra(era);
            
            document.querySelectorAll('.era-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Фильтрация по настроению
 */
function filterByMood(mood) {
    const filtered = allPoems.filter(p => p.mood === mood);
    const moodInfo = moodDescriptions[mood];

    if (!moodInfo) {
        console.warn(`Настроение "${mood}" не найдено в moodDescriptions`);
        document.getElementById('mood-title').textContent = mood || 'Все настроения';
        document.getElementById('mood-description').textContent = 'Стихотворения с данным настроением';
        document.getElementById('mood-count').textContent = filtered.length;
    } else {
        document.getElementById('mood-title').textContent = moodInfo.title;
        document.getElementById('mood-description').textContent = moodInfo.description;
        document.getElementById('mood-count').textContent = filtered.length;
    }

    const container = document.getElementById('mood-poems');
    container.innerHTML = '';

    filtered.slice(0, 6).forEach(poem => {
        const card = createPoemCard(poem);
        container.appendChild(card);
    });

    document.getElementById('mood-results').style.display = 'block';
    document.getElementById('mood-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Создание облака тегов
 */
function createTagCloud() {
    const tagCount = {};
    
    allPoems.forEach(poem => {
        if (poem.tags && Array.isArray(poem.tags)) {
            poem.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        }
    });

    const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    const maxCount = Math.max(...sortedTags.map(t => t[1]));
    const container = document.getElementById('tag-cloud');
    container.innerHTML = '';

    sortedTags.forEach(([tag, count]) => {
        const size = 0.8 + (count / maxCount) * 1.5;
        const badge = document.createElement('span');
        badge.className = 'badge tag-badge';
        badge.style.fontSize = `${size}rem`;
        badge.style.cursor = 'pointer';
        badge.textContent = `${tag} (${count})`;
        badge.onclick = () => filterByTag(tag);
        container.appendChild(badge);
    });
}

/**
 * Фильтрация по тегу
 */
function filterByTag(tag) {
    const filtered = allPoems.filter(p => p.tags && p.tags.includes(tag));
    
    document.getElementById('selected-tag').textContent = tag;
    const container = document.getElementById('tag-poems');
    container.innerHTML = '';

    filtered.slice(0, 6).forEach(poem => {
        const card = createPoemCard(poem);
        container.appendChild(card);
    });

    document.getElementById('tag-results').style.display = 'block';
    document.getElementById('tag-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Фильтрация по эпохе
 */
function filterByEra(era) {
    const [start, end] = era.split('-').map(Number);
    const filtered = allPoems.filter(p => {
        const year = parseInt(p.year);
        return year >= start && year <= end;
    });

    const eraInfo = eraDescriptions[era];
    document.getElementById('era-title').textContent = eraInfo.title;
    document.getElementById('era-description').textContent = eraInfo.description;

    const container = document.getElementById('era-poems');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">К сожалению, в нашей коллекции нет стихов из этой эпохи.</p></div>';
    } else {
        filtered.slice(0, 6).forEach(poem => {
            const card = createPoemCard(poem);
            container.appendChild(card);
        });
    }

    document.getElementById('era-results').style.display = 'block';
    document.getElementById('era-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Создание статистики поэтов
 */
function createPoetStats() {
    const poetPoemCount = {};
    
    allPoems.forEach(poem => {
        const authorId = poem.authorId;
        poetPoemCount[authorId] = (poetPoemCount[authorId] || 0) + 1;
    });

    const sortedPoets = Object.entries(poetPoemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const container = document.getElementById('poet-stats');
    container.innerHTML = '';

    sortedPoets.forEach(([poetId, count]) => {
        const poet = allPoets.find(p => p.id === poetId);
        if (!poet) return;

        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        
        const card = document.createElement('div');
        card.className = 'card h-100';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title poet-name">${poet.name}</h5>
                <p class="card-text text-muted small">${poet.period || 'Период неизвестен'}</p>
                <div class="mt-3">
                    <div class="d-flex justify-content-between mb-2 poet-stat-text">
                        <span>Стихотворений:</span>
                        <strong>${count}</strong>
                    </div>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${(count / Math.max(...Object.values(poetPoemCount))) * 100}%">
                            ${count}
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <span class="badge poet-style-badge">${poet.style || 'Стиль не указан'}</span>
                </div>
            </div>
        `;
        
        col.appendChild(card);
        container.appendChild(col);
    });
}

/**
 * Отображение случайных фактов
 */
function displayRandomFacts() {
    const container = document.getElementById('facts-container');
    container.innerHTML = '';
    
    if (!allFacts || allFacts.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">Факты загружаются...</p></div>';
        return;
    }
    
    const randomFacts = [...allFacts]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    randomFacts.forEach(fact => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        
        const card = document.createElement('div');
        card.className = 'card h-100 border-0 fact-card';
        card.innerHTML = `
            <div class="card-body">
                <h6 class="fw-bold mb-2 fact-title">${fact.title || 'Интересный факт'}</h6>
                <p class="card-text fact-text">${fact.text}</p>
                <span class="badge fact-badge">${getCategoryName(fact.category)}</span>
            </div>
        `;
        
        col.appendChild(card);
        container.appendChild(col);
    });
}

/**
 * Получение названия категории факта
 */
function getCategoryName(category) {
    return categoryNames[category] || category;
}

/**
 * Создание карточки стихотворения
 */
function createPoemCard(poem) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100 poem-card';
    card.style.cursor = 'pointer';
    
    const preview = poem.text.split('\n').slice(0, 4).join('\n');
    
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${poem.title}</h5>
            <p class="card-text text-muted small">${poem.author}, ${poem.year}</p>
            <p class="card-text poem-preview">${preview}...</p>
            <div class="mt-2">
                ${poem.tags ? poem.tags.slice(0, 3).map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        if (typeof showPoemModal === 'function') {
            showPoemModal(poem.id);
        }
    });
    
    col.appendChild(card);
    return col;
}
