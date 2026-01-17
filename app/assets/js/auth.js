
const Auth = {
    // Simulando o que a API devolverá após a integração Kiwify
    async login(email, password) {
        // No futuro: const response = await fetch('api/login', { method: 'POST', body: ... });
        
        if (email === "admin@gestminds.com.br" && password === "123456") {
            const userData = {
                name: "João Silva",
                email: email,
                plan: "Pro", // Identificado automaticamente (Basic, Pro ou Enterprise)
                status: "active",
                token: "jwt_gerado_pela_nossa_futura_api"
            };
            
            localStorage.setItem('@GestMinds:user', JSON.stringify(userData));
            window.location.href = 'index.html';
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
