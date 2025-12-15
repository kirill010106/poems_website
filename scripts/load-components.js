// Счетчики для отслеживания загрузки компонентов
let componentsLoaded = {
    header: false,
    footer: false,
    favorites: false,
    auth: false
};

// Определяем базовый путь для GitHub Pages (глобальная переменная)
function getComponentBasePath() {
    const path = window.location.pathname;
    // Если мы в подпапке pages/, возвращаемся на уровень выше
    if (path.includes('/pages/')) {
        return '../';
    }
    return './';
}

// Глобально доступный базовый путь
const componentBasePath = getComponentBasePath();
window.basePath = componentBasePath; // Для использования в других скриптах

// Время начала загрузки (для минимального показа loader'а)
const loadStartTime = Date.now();
const MIN_LOADER_DURATION = 300; // минимум 300ms показа loader'а

$(document).ready(function () {

    // favorites.js уже загружен через <script> тег в HTML
    componentsLoaded.favorites = true;
    console.log('✅ favorites.js уже загружен');
    // Загружаем auth.js
    loadAuthScript();

    // Загружаем футер
    $('#footer-placeholder').load(componentBasePath + 'includes/footer.html', function () {
        console.log('Футер загружен');
        
        // Инициализируем кнопку "Наверх"
        initBackToTop();
        
        componentsLoaded.footer = true;
        checkAllComponentsLoaded();
    });

});

// Функция загрузки auth.js
function loadAuthScript() {
    const authScript = document.createElement('script');
    authScript.src = componentBasePath + 'scripts/auth.js';
    authScript.onload = function() {
        console.log('✅ auth.js загружен');
        componentsLoaded.auth = true;
        // После загрузки auth.js загружаем хедер
        loadHeader();
    };
    document.head.appendChild(authScript);
}

// Функция загрузки хедера
function loadHeader() {
    $('#header-placeholder').load(componentBasePath + 'includes/header.html', function () {
        console.log('Хедер загружен');

        // Инициализируем тему
        if (typeof initTheme === 'function') {
            initTheme();
        }

        // Устанавливаем активный пункт меню
        setActiveNavLink();

        // Обновляем счетчик избранного
        if (typeof updateFavoritesCounter === 'function') {
            updateFavoritesCounter();
        }

        componentsLoaded.header = true;
        checkAllComponentsLoaded();
    });
}

// Проверка загрузки всех компонентов и скрытие loader'а
function checkAllComponentsLoaded() {
    if (componentsLoaded.header && componentsLoaded.footer && componentsLoaded.favorites && componentsLoaded.auth) {
        console.log('✅ Все компоненты загружены');
        
        // Исправляем абсолютные пути для GitHub Pages
        fixAbsolutePaths();
        
        // Генерируем событие для других скриптов
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
        
        // Рассчитываем, сколько времени прошло с начала загрузки
        const loadDuration = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, MIN_LOADER_DURATION - loadDuration);
        
        // Скрываем loader с задержкой (если нужно)
        setTimeout(() => {
            hidePageLoader();
        }, remainingTime);
    }
}

// Функция скрытия page loader
function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.add('hidden');
        // Удаляем из DOM через 500ms после начала анимации
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// Функция для активного пункта меню
function setActiveNavLink() {
    const path = window.location.pathname;

    // Убираем active у всех
    $('.nav-link').removeClass('active');

    let page = 'index';

    if (path.includes('poems.html') || path.includes('poem-detail.html')) {
        page = 'poems';
    } else if (path.includes('poets.html') || path.includes('poet-detail.html')) {
        page = 'poets';
    } else if (path.includes('analysis.html')) {
        page = 'analysis';
    } else if (path.includes('surprise.html')) {
        page = 'surprise';
    } else if (path.includes('favorites.html')) {
        page = 'favorites';
    } else if (path.includes('nothing.html')) {
        page = 'nothing';
    } else if (path === '/' || path.includes('index.html')) {
        page = 'index';
    }

    // Добавляем active нужной ссылке
    $(`.nav-link[data-page="${page}"]`).addClass('active');
}

// Функция инициализации кнопки "Наверх"
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Функция для исправления абсолютных путей (для GitHub Pages)
function fixAbsolutePaths() {
    const basePath = componentBasePath;
    
    // Исправляем все ссылки с абсолютными путями
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
            link.setAttribute('href', basePath + href.substring(1));
        }
    });
    
    // Исправляем все изображения с абсолютными путями
    document.querySelectorAll('img[src^="/"]').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/') && !src.startsWith('//')) {
            img.setAttribute('src', basePath + src.substring(1));
        }
    });
    
    console.log('✅ Абсолютные пути исправлены для GitHub Pages');
}