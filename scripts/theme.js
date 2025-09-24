document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    const themeLabel = document.getElementById('theme-label');
    const htmlElement = document.documentElement;

    // Проверяем системные настройки, если тема не выбрана
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    } else {
        setTheme(savedTheme);
    }

    // Обработчик клика
    toggleButton.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Обновляем текст и иконку
        if (theme === 'dark') {
            toggleButton.innerHTML = '<span>☀️</span> <span id="theme-label">Светлая</span>';
        } else {
            toggleButton.innerHTML = '<span>🌙</span> <span id="theme-label">Темная</span>';
        }
    }
});