// assets/js/dashboard.js

/** * REMOVEMOS as declarações de SUPABASE_URL e SUPABASE_ANON_KEY 
 * pois elas já vêm do auth.js 
 */

if (typeof _supabase === 'undefined') {
    var _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('@GestMinds:user'));
    
    if (!user) {
        console.warn("Usuário não encontrado no localStorage.");
        return;
    }

    // A. Preencher dados do Perfil com verificações de segurança
    const elName = document.getElementById('user-display-name');
    const elPlan = document.getElementById('plan-badge');
    const elInitial = document.getElementById('user-initial');

    if (elName) elName.innerText = user.name || 'Usuário';
    if (elPlan) elPlan.innerText = `Plano ${user.plan || 'Pro'}`;
    if (elInitial) elInitial.innerText = (user.name || 'U').charAt(0).toUpperCase();

    // B. Buscar estatísticas reais do banco
    // Usamos o user.id que é o UUID único do Supabase
    if (user.id) {
        fetchStats(user.id);
    } else {
        console.error("ID do usuário não encontrado. Verifique o login.");
    }
});

async function fetchStats(userId) {
    try {
        // Busca contagem de Clientes
        const { count: countClientes, error: errC } = await _supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'cliente');

        // Busca contagem de Fornecedores
        const { count: countFornecedores, error: errF } = await _supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'fornecedor');

        if (errC || errF) throw (errC || errF);

        // Atualiza os contadores na tela
        const elCountC = document.getElementById('count-clientes');
        const elCountF = document.getElementById('count-fornecedores');

        if (elCountC) elCountC.innerText = countClientes || 0;
        if (elCountF) elCountF.innerText = countFornecedores || 0;

    } catch (error) {
        console.error('Erro ao buscar estatísticas do Dashboard:', error);
        // Fallback para zero em caso de erro
        if (document.getElementById('count-clientes')) document.getElementById('count-clientes').innerText = "0";
        if (document.getElementById('count-fornecedores')) document.getElementById('count-fornecedores').innerText = "0";
    }
}