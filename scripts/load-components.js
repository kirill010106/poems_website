// Счетчики для отслеживания загрузки компонентов
let componentsLoaded = {
    header: false,
    footer: false,
    favorites: false
};

// Время начала загрузки (для минимального показа loader'а)
const loadStartTime = Date.now();
const MIN_LOADER_DURATION = 300; // минимум 300ms показа loader'а

$(document).ready(function () {

    // Загружаем favorites.js динамически ПЕРВЫМ
    const favScript = document.createElement('script');
    favScript.src = '/scripts/favorites.js';
    favScript.onload = function() {
        console.log('✅ favorites.js загружен');
        componentsLoaded.favorites = true;
        // После загрузки favorites.js загружаем хедер
        loadHeader();
    };
    document.head.appendChild(favScript);

    // Загружаем футер
    $('#footer-placeholder').load('/includes/footer.html', function () {
        console.log('Футер загружен');
        componentsLoaded.footer = true;
        checkAllComponentsLoaded();
    });

});

// Функция загрузки хедера (выделена отдельно для контроля порядка)
function loadHeader() {
    $('#header-placeholder').load('/includes/header.html', function () {
        console.log('Хедер загружен');

        // Инициализируем тему
        if (typeof initTheme === 'function') {
            initTheme();
        }

        // Устанавливаем активный пункт меню
        setActiveNavLink();

        // Обновляем счетчик избранного (теперь функция точно определена)
        if (typeof updateFavoritesCounter === 'function') {
            updateFavoritesCounter();
        }

        componentsLoaded.header = true;
        checkAllComponentsLoaded();

        // Инициализируем модальные окна Bootstrap (если нужно)
        // $('[data-bs-toggle="modal"]').modal(); — не нужно, Bootstrap сам инициализирует
    });
}

// Проверка загрузки всех компонентов и скрытие loader'а
function checkAllComponentsLoaded() {
    if (componentsLoaded.header && componentsLoaded.footer && componentsLoaded.favorites) {
        console.log('✅ Все компоненты загружены');
        
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