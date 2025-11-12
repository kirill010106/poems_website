// ==================== ТЕМА (LIGHT/DARK) ====================

// Шаг 1: Устанавливаем тему ДО загрузки DOM (избегаем мигания)
(function() {
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        console.log('🎨 Тема загружена из localStorage:', savedTheme);
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', defaultTheme);
        console.log('🎨 Установлена системная тема:', defaultTheme);
    }
})();

// Шаг 2: Глобальная функция для инициализации переключателя темы
// Вызывается из load-components.js после загрузки header
function initTheme() {
    const toggleButton = document.getElementById('theme-toggle');
    
    if (!toggleButton) {
        console.warn('⚠️ Кнопка theme-toggle не найдена');
        return;
    }

    console.log('✅ Инициализация переключателя темы');

    const htmlElement = document.documentElement;
    
    // Устанавливаем правильную иконку при загрузке
    updateThemeButton();

    // Помечаем кнопку как инициализированную
    toggleButton.setAttribute('data-theme-initialized', 'true');

    // Обработчик клика
    toggleButton.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log('🔄 Переключение темы:', currentTheme, '→', newTheme);
        setTheme(newTheme);
    });

    // Функция установки темы
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeButton();
        console.log('💾 Тема сохранена:', theme);
    }

    // Функция обновления кнопки
    function updateThemeButton() {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        
        // Обновляем текст и иконку
        if (currentTheme === 'dark') {
            toggleButton.innerHTML = '<span>☀️</span> <span id="theme-label">Светлая</span>';
        } else {
            toggleButton.innerHTML = '<span>🌙</span> <span id="theme-label">Тёмная</span>';
        }
        
        console.log('🎨 Кнопка темы обновлена для режима:', currentTheme);
    }
}

// Шаг 3: Fallback - если header загружается раньше, чем вызывается initTheme
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли уже кнопка и не инициализирована ли она
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton && !toggleButton.hasAttribute('data-theme-initialized')) {
        console.log('🔧 Fallback: инициализация темы через DOMContentLoaded');
        initTheme();
        toggleButton.setAttribute('data-theme-initialized', 'true');
    }
});