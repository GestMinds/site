const SUPABASE_URL = 'https://dduistcgwxuiciyqeidd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWlzdGNnd3h1aWNpeXFlaWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTc3MzYsImV4cCI6MjA4NDE5MzczNn0.is6SOIkl-nbhsDTy4W7sUoHrQGSTZdyFL_dlAOhnG8g';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Auth = {
    async login(email, password) {
        try {
            // Consulta no Supabase se existe usuário com esse e-mail e senha
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .eq('status', 'active') // Só deixa logar se o status for ativo
                .single();

            if (error || !data) {
                console.error('Erro no login:', error);
                alert("E-mail ou senha incorretos.");
                return false;
            }

            // Se encontrou o usuário, salva os dados reais vindos do banco (Kiwify)
            const userData = {
                name: data.full_name,
                email: data.email,
                plan: data.plan_type, 
                status: data.status,
                token: 'session_active_' + btoa(data.email) // Mock de token simples
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
        const isLoginPage = path.includes('login.html') || path === '/login';

        // Se não houver usuário e não estiver na página de login, redireciona
        if (!user && !isLoginPage) {
            window.location.href = 'login.html';
        } 
        // Se já estiver logado e tentar entrar no login, manda para o index
        else if (user && isLoginPage) {
            window.location.href = 'index.html';
        }
    }
};

// Executa a proteção de rota imediatamente
Auth.checkAccess();