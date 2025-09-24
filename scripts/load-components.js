$(document).ready(function () {

    // Загружаем хедер
    $('#header-placeholder').load('/includes/header.html', function () {
        console.log('Хедер загружен');

        // Инициализируем тему
        if (typeof initTheme === 'function') {
            initTheme();
        }

        // Устанавливаем активный пункт меню
        setActiveNavLink();

        // Инициализируем модальные окна Bootstrap (если нужно)
        // $('[data-bs-toggle="modal"]').modal(); — не нужно, Bootstrap сам инициализирует
    });

    // Загружаем футер
    $('#footer-placeholder').load('/includes/footer.html', function () {
        console.log('Футер загружен');
    });

});

// Функция для активного пункта меню
function setActiveNavLink() {
    const path = window.location.pathname;

    // Убираем active у всех
    $('.nav-link').removeClass('active');

    let page = 'index';

    if (path.includes('poets.html')) {
        page = 'poets';
    } else if (path.includes('nothing.html')) {
        page = 'nothing';
    } else if (path === '/' || path.includes('index.html')) {
        page = 'index';
    }

    // Добавляем active нужной ссылке
    $(`.nav-link[data-page="${page}"]`).addClass('active');
}