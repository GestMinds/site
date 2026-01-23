// assets/js/auth.js

window.SUPABASE_URL = 'https://dduistcgwxuiciyqeidd.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWlzdGNnd3h1aWNpeXFlaWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTc3MzYsImV4cCI6MjA4NDE5MzczNn0.is6SOIkl-nbhsDTy4W7sUoHrQGSTZdyFL_dlAOhnG8g';

// AQUI ESTÁ O SEGREDO: Não sobrescrevemos o 'window.supabase' original.
// Criamos um novo nome para a nossa conexão.
window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const Auth = {
    async login(email, password) {
        try {
            // Usamos a nossa instância supabaseClient
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .eq('status', 'active')
                .single();

            if (error || !data) {
                console.error('Erro no login:', error);
                alert("E-mail ou senha incorretos.");
                return false;
            }

            const userData = {
                id: data.id, 
                name: data.full_name,
                email: data.email,
                plan: data.plan_type, 
                status: data.status,
                token: 'session_active_' + btoa(data.email)
            };
            
            localStorage.setItem('@GestMinds:user', JSON.stringify(userData));
            window.location.href = 'index.html';
            return true;

        } catch (err) {
            console.error('Erro inesperado:', err);
            alert("Ocorreu um erro ao tentar fazer login.");
            return false;
        }
    },

    logout() {
        localStorage.removeItem('@GestMinds:user');
        window.location.href = 'login.html';
    },

    isAuthenticated() {
        return localStorage.getItem('@GestMinds:user') !== null;
    },

    checkAccess() {
        const user = localStorage.getItem('@GestMinds:user');
        const path = window.location.pathname;
        const isLoginPage = path.includes('login.html');

        if (!user && !isLoginPage) {
            window.location.href = 'login.html';
        } else if (user && isLoginPage) {
            window.location.href = 'index.html';
        }
    }
};

Auth.checkAccess();