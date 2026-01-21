// assets/js/dashboard.js

// 1. Configuração do Supabase (Mesma do auth.js)
const SUPABASE_URL = 'https://dduistcgwxuiciyqeidd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWlzdGNnd3h1aWNpeXFlaWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTc3MzYsImV4cCI6MjA4NDE5MzczNn0.is6SOIkl-nbhsDTy4W7sUoHrQGSTZdyFL_dlAOhnG8g'; // Sua chave completa aqui
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('@GestMinds:user'));
    
    if (!user) return;

    // A. Preencher dados do Perfil
    document.getElementById('user-display-name').innerText = user.name;
    document.getElementById('plan-badge').innerText = `Plano ${user.plan}`;
    document.getElementById('user-initial').innerText = user.name.charAt(0).toUpperCase();

    // B. Buscar Contagem de Clientes e Fornecedores Reais
    fetchStats(user.email);
});

async function fetchStats(ownerEmail) {
    try {
        // Busca Clientes
        const { count: countClientes, error: errC } = await _supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('owner_email', ownerEmail)
            .eq('type', 'cliente');

        // Busca Fornecedores
        const { count: countFornecedores, error: errF } = await _supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('owner_email', ownerEmail)
            .eq('type', 'fornecedor');

        if (errC || errF) throw (errC || errF);

        // Atualiza a tela
        document.getElementById('count-clientes').innerText = countClientes || 0;
        document.getElementById('count-fornecedores').innerText = countFornecedores || 0;

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        document.getElementById('count-clientes').innerText = "0";
        document.getElementById('count-fornecedores').innerText = "0";
    }
}