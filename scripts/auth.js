/**
 * Система авторизации и регистрации пользователей
 * Использует LocalStorage для хранения данных (клиентское приложение)
 */
class AuthManager {
    constructor() {
        this.storageKey = 'poetryUsers';
        this.currentUserKey = 'poetryCurrentUser';
        this.initialized = false;
    }

    /**
     * Инициализация системы авторизации
     */
    init() {
        if (this.initialized) return;
        
        // Инициализируем хранилище пользователей
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        
        // Обновляем UI
        this.updateUI();
        
        // Подключаем обработчики событий
        this.attachEventHandlers();
        
        this.initialized = true;
        console.log('AuthManager инициализирован');
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Валидация email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Регистрация нового пользователя
     */
    register(username, email, password) {
        // Валидация
        if (!username || username.length < 3) {
            return { success: false, message: 'Имя пользователя должно содержать минимум 3 символа' };
        }
        
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Некорректный email адрес' };
        }
        
        if (!password || password.length < 6) {
            return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
        }

        const users = JSON.parse(localStorage.getItem(this.storageKey));
        
        // Проверяем уникальность email
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        // Проверяем уникальность username
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Пользователь с таким именем уже существует' };
        }

        // Создаём нового пользователя
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Автоматический вход после регистрации
        this.performLogin(newUser);

        return { success: true, message: `Добро пожаловать, ${username}!` };
    }

    /**
     * Вход пользователя
     */
    login(email, password) {
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Некорректный email адрес' };
        }

        const users = JSON.parse(localStorage.getItem(this.storageKey));
        const hashedPassword = this.hashPassword(password);
        const user = users.find(u => u.email === email && u.password === hashedPassword);

        if (!user) {
            return { success: false, message: 'Неверный email или пароль' };
        }

        // Обновляем время последнего входа
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Выполняем вход
        this.performLogin(user);

        return { success: true, message: `С возвращением, ${user.username}!` };
    }

    /**
     * Выполнение входа (общая логика)
     */
    performLogin(user) {
        // Сохраняем текущего пользователя (без пароля)
        const currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin || new Date().toISOString()
        };
        
        localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
        
        // Генерируем событие для других компонентов
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: currentUser }));
        
        // Обновляем UI
        this.updateUI();
    }

    /**
     * Выход пользователя
     */
    logout() {
        const user = this.getCurrentUser();
        localStorage.removeItem(this.currentUserKey);
        
        // Генерируем событие
        document.dispatchEvent(new CustomEvent('userLoggedOut', { detail: user }));
        
        // Обновляем UI
        this.updateUI();
        
        // Показываем уведомление
        if (typeof showNotification === 'function') {
            showNotification('Вы вышли из системы', 'info');
        }
        
        // Перезагружаем страницу для сброса состояния
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    /**
     * Получить текущего пользователя
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(this.currentUserKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Проверка авторизации
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Получить всех пользователей (для отладки)
     */
    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    /**
     * Обновление UI в зависимости от статуса авторизации
     */
    updateUI() {
        const user = this.getCurrentUser();
        const loginBtn = document.querySelector('.login-btn');
        const registerBtn = document.querySelector('.register-btn');
        
        if (!loginBtn || !registerBtn) {
            // Header ещё не загружен, попробуем позже
            setTimeout(() => this.updateUI(), 100);
            return;
        }
        
        if (user) {
            // Пользователь авторизован
            this.showAuthenticatedUI(user, loginBtn, registerBtn);
        } else {
            // Пользователь не авторизован
            this.showGuestUI(loginBtn, registerBtn);
        }
    }

    /**
     * UI для авторизованного пользователя
     */
    showAuthenticatedUI(user, loginBtn, registerBtn) {
        // Показываем имя пользователя вместо кнопки входа
        loginBtn.textContent = `👤 ${user.username}`;
        loginBtn.classList.remove('btn-outline-secondary');
        loginBtn.classList.add('btn-outline-primary');
        loginBtn.removeAttribute('data-bs-toggle');
        loginBtn.removeAttribute('data-bs-target');
        loginBtn.style.cursor = 'default';
        loginBtn.title = `Вы вошли как ${user.username}`;
        
        // Меняем кнопку регистрации на кнопку выхода
        registerBtn.textContent = 'Выйти';
        registerBtn.classList.remove('btn-main');
        registerBtn.classList.add('btn-outline-danger');
        registerBtn.removeAttribute('data-bs-toggle');
        registerBtn.removeAttribute('data-bs-target');
        
        // Обработчик выхода
        registerBtn.onclick = (e) => {
            e.preventDefault();
            this.confirmLogout();
        };
    }

    /**
     * UI для неавторизованного пользователя
     */
    showGuestUI(loginBtn, registerBtn) {
        // Восстанавливаем кнопку входа
        loginBtn.textContent = 'Вход';
        loginBtn.classList.remove('btn-outline-primary');
        loginBtn.classList.add('btn-outline-secondary');
        loginBtn.setAttribute('data-bs-toggle', 'modal');
        loginBtn.setAttribute('data-bs-target', '#loginModal');
        loginBtn.style.cursor = 'pointer';
        loginBtn.title = 'Войти в систему';
        loginBtn.onclick = null;
        
        // Восстанавливаем кнопку регистрации
        registerBtn.textContent = 'Регистрация';
        registerBtn.classList.remove('btn-outline-danger');
        registerBtn.classList.add('btn-main');
        registerBtn.setAttribute('data-bs-toggle', 'modal');
        registerBtn.setAttribute('data-bs-target', '#registerModal');
        registerBtn.onclick = null;
    }

    /**
     * Подтверждение выхода
     */
    confirmLogout() {
        const modalHtml = `
            <div class="modal fade" id="logoutConfirmModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Подтверждение выхода</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Вы уверены, что хотите выйти из системы?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-danger" id="confirmLogoutBtn">Выйти</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Удаляем старое модальное окно, если есть
        const oldModal = document.getElementById('logoutConfirmModal');
        if (oldModal) oldModal.remove();
        
        // Добавляем новое
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('logoutConfirmModal'));
        modal.show();
        
        // Обработчик подтверждения
        document.getElementById('confirmLogoutBtn').addEventListener('click', () => {
            modal.hide();
            this.logout();
        });
        
        // Удаляем модальное окно после закрытия
        document.getElementById('logoutConfirmModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Подключение обработчиков событий для форм
     */
    attachEventHandlers() {
        // Ждём загрузки компонентов
        document.addEventListener('componentsLoaded', () => {
            this.setupLoginForm();
            this.setupRegisterForm();
        });
        
        // Если компоненты уже загружены
        if (document.getElementById('loginForm')) {
            this.setupLoginForm();
            this.setupRegisterForm();
        }
    }

    /**
     * Настройка формы входа
     */
    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            
            // Скрываем предыдущие ошибки
            errorDiv.classList.add('d-none');
            
            // Выполняем вход
            const result = this.login(email, password);
            
            if (result.success) {
                // Успешный вход
                if (typeof showNotification === 'function') {
                    showNotification(result.message, 'success');
                }
                
                // Закрываем модальное окно
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (modal) modal.hide();
                
                // Очищаем форму
                form.reset();
                
            } else {
                // Ошибка входа
                errorDiv.textContent = result.message;
                errorDiv.classList.remove('d-none');
                
                // Трясём форму
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
            }
        });
    }

    /**
     * Настройка формы регистрации
     */
    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const errorDiv = document.getElementById('registerError');
            const successDiv = document.getElementById('registerSuccess');
            
            // Скрываем предыдущие сообщения
            errorDiv.classList.add('d-none');
            successDiv.classList.add('d-none');
            
            // Проверка совпадения паролей
            if (password !== passwordConfirm) {
                errorDiv.textContent = 'Пароли не совпадают';
                errorDiv.classList.remove('d-none');
                
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
                return;
            }
            
            // Выполняем регистрацию
            const result = this.register(username, email, password);
            
            if (result.success) {
                // Успешная регистрация
                if (typeof showNotification === 'function') {
                    showNotification(result.message, 'success');
                }
                
                // Закрываем модальное окно
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (modal) modal.hide();
                
                // Очищаем форму
                form.reset();
                
            } else {
                // Ошибка регистрации
                errorDiv.textContent = result.message;
                errorDiv.classList.remove('d-none');
                
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
            }
        });
    }
}

// Создаём глобальный экземпляр менеджера авторизации
const authManager = new AuthManager();

// Инициализируем при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => authManager.init());
} else {
    authManager.init();
}