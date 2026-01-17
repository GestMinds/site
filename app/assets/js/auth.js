// Simulação de autenticação GestMinds (MVP DIA 1)
const Auth = {
    login(email, password) {
        // Mock simples para o MVP
        if (email === "admin@gestminds.com.br" && password === "123456") {
            const userData = {
                name: "Usuário GestMinds",
                email: email,
                role: "admin",
                token: "session_active_mock"
            };

            localStorage.setItem('@GestMinds:user', JSON.stringify(userData));

            // Redireciona para o dashboard
            window.location.href = "/index.html";
            return true;
        }

        return false;
    },

    logout() {
        localStorage.removeItem('@GestMinds:user');
        // Volta para o login (index)
        window.location.href = "/";
    },

    isAuthenticated() {
        return localStorage.getItem('@GestMinds:user') !== null;
    },

    // Protege páginas privadas (ex: dashboard)
        checkAccess() {
        const user = localStorage.getItem('@GestMinds:user');
        const isLoginPage = window.location.pathname.includes('login.html');

        if (!user && !isLoginPage) {

            window.location.href = 'login.html';
        } else if (user && isLoginPage) {

            window.location.href = 'index.html';
        }
    }
};

Auth.checkAccess();
