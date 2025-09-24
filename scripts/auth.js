document.addEventListener('DOMContentLoaded', function () {

    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Форма входа отправлена (заглушка)');
            // Позже здесь будет fetch к /login
        });
    }

    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const password = document.getElementById('registerPassword').value;
            const confirm = document.getElementById('registerPasswordConfirm').value;

            if (password !== confirm) {
                alert('Пароли не совпадают!');
                return;
            }

            alert('Форма регистрации отправлена (заглушка)');
            // Позже здесь будет fetch к /register
        });
    }

});