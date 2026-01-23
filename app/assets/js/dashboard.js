// assets/js/dashboard.js

// Usamos o supabaseClient que já foi inicializado no auth.js
const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;

document.addEventListener('DOMContentLoaded', async () => {
    const userData = localStorage.getItem('@GestMinds:user');
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user) {
        console.warn("Usuário não encontrado no localStorage.");
        return;
    }

    // A. Preencher dados do Perfil
    const elName = document.getElementById('user-display-name');
    const elPlan = document.getElementById('plan-badge');
    const elInitial = document.getElementById('user-initial');

    if (elName) elName.innerText = user.name || 'Usuário';
    if (elPlan) elPlan.innerText = `Plano ${user.plan || 'Pro'}`;
    if (elInitial) elInitial.innerText = (user.name || 'U').charAt(0).toUpperCase();

    // B. Buscar estatísticas reais do banco (UUID ou ID de texto como o "6")
    if (user.id) {
        const userIdStr = String(user.id);
        fetchStats(userIdStr);
        renderFinanceChart(userIdStr);
    }
});

async function fetchStats(userId) {
    try {
        // 1. Busca contagem de Clientes
        const { count: countClientes } = await client
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'cliente');

        // 2. Busca contagem de Fornecedores
        const { count: countFornecedores } = await client
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'fornecedor');

        // 3. Busca Dados Financeiros para o Resumo
        const { data: finances } = await client
            .from('finances')
            .select('amount, type')
            .eq('user_id', userId);

        // --- Atualização do DOM ---

        // Contadores superiores
        if (document.getElementById('count-clientes')) 
            document.getElementById('count-clientes').innerText = countClientes || 0;
        
        if (document.getElementById('count-fornecedores')) 
            document.getElementById('count-fornecedores').innerText = countFornecedores || 0;

        // Cards de Resumo Financeiro (Novos IDs do HTML)
        if (finances) {
            const receitas = finances.filter(f => f.type === 'receita').reduce((acc, f) => acc + f.amount, 0);
            const despesas = finances.filter(f => f.type === 'despesa').reduce((acc, f) => acc + f.amount, 0);
            const saldo = receitas - despesas;

            if (document.getElementById('dash-receitas')) 
                document.getElementById('dash-receitas').innerText = `R$ ${receitas.toFixed(2)}`;
            
            if (document.getElementById('dash-despesas')) 
                document.getElementById('dash-despesas').innerText = `R$ ${despesas.toFixed(2)}`;
            
            if (document.getElementById('dash-saldo')) 
                document.getElementById('dash-saldo').innerText = `R$ ${saldo.toFixed(2)}`;
        }

    } catch (error) {
        console.error('Erro ao carregar dados do Dashboard:', error);
    }
}

async function renderFinanceChart(userId) {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;

    try {
        // Buscamos os últimos 7 lançamentos para não poluir o gráfico
        const { data, error } = await client
            .from('finances')
            .select('amount, type, due_date')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .limit(7);

        if (error) throw error;

        const ctx = canvas.getContext('2d');
        const labels = data.map(d => new Date(d.due_date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}));
        const values = data.map(d => d.type === 'receita' ? d.amount : -d.amount);

        // Destruir gráfico anterior se existir (evita bugs de hover)
        if (window.myChart) window.myChart.destroy();

        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Movimentação (R$)',
                    data: values,
                    backgroundColor: values.map(v => v >= 0 ? '#10b981' : '#ef4444'),
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { display: false }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Erro ao gerar gráfico:", err);
    }
}