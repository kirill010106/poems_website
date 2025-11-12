// Простая фронтенд-авторизация (без бэкенда)
class AuthManager {
    constructor() {
        this.storageKey = 'poetryUsers';
        this.currentUserKey = 'poetryCurrentUser';
        this.init();
    }

    init() {
        // Инициализируем хранилище, если его нет
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        
        // Проверяем, авторизован ли пользователь
        this.updateUI();
    }

    register(username, email, password) {
        const users = JSON.parse(localStorage.getItem(this.storageKey));
        
        // Проверяем, существует ли уже такой email
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        // Создаём нового пользователя
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // В реальном приложении пароль нужно хешировать!
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        return { success: true, message: 'Регистрация успешна! Теперь вы можете войти.' };
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem(this.storageKey));
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Неверный email или пароль' };
        }

        // Сохраняем текущего пользователя (без пароля)
        const currentUser = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
        this.updateUI();

        return { success: true, message: 'Вход выполнен успешно!' };
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
        this.updateUI();
        window.location.reload();
    }

    getCurrentUser() {
        const userStr = localStorage.getItem(this.currentUserKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    updateUI() {
        const user = this.getCurrentUser();
        const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
        const registerBtn = document.querySelector('[data-bs-target="#registerModal"]');
        
        if (user) {
            // Пользователь авторизован - показываем имя и кнопку выхода
            if (loginBtn) {
                loginBtn.textContent = user.username;
                loginBtn.removeAttribute('data-bs-toggle');
                loginBtn.removeAttribute('data-bs-target');
                loginBtn.style.cursor = 'default';
            }
            
            if (registerBtn) {
                registerBtn.textContent = 'Выйти';
                registerBtn.removeAttribute('data-bs-target');
                registerBtn.setAttribute('data-bs-toggle', 'modal');
                registerBtn.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('Вы уверены, что хотите выйти?')) {
                        this.logout();
                    }
                };
            }
        }
    }
}

// Создаём глобальный экземпляр
const authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', function () {
    
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            
            const result = authManager.login(email, password);
            
            if (result.success) {
                // Закрываем модальное окно
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                // Перезагружаем страницу для обновления UI
                window.location.reload();
            } else {
                // Показываем ошибку
                errorDiv.textContent = result.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirm = document.getElementById('registerPasswordConfirm').value;
            const errorDiv = document.getElementById('registerError');
            const successDiv = document.getElementById('registerSuccess');

            // Скрываем предыдущие сообщения
            errorDiv.classList.add('d-none');
            successDiv.classList.add('d-none');

            // Валидация
            if (password !== confirm) {
                errorDiv.textContent = 'Пароли не совпадают!';
                errorDiv.classList.remove('d-none');
                return;
            }

            if (password.length < 6) {
                errorDiv.textContent = 'Пароль должен содержать минимум 6 символов';
                errorDiv.classList.remove('d-none');
                return;
            }

            // Регистрация
            const result = authManager.register(username, email, password);
            
            if (result.success) {
                successDiv.textContent = result.message;
                successDiv.classList.remove('d-none');
                
                // Очищаем форму
                registerForm.reset();
                
                // Через 2 секунды переключаем на форму входа
                setTimeout(() => {
                    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    registerModal.hide();
                    
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                }, 2000);
            } else {
                errorDiv.textContent = result.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

});