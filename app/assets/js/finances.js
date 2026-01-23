// assets/js/finances.js

function getLoggedUser() {
    const userData = localStorage.getItem('@GestMinds:user');
    return userData ? JSON.parse(userData) : null;
}

function toggleModal(show) {
    const modal = document.getElementById('modal-financeiro');
    if (modal) modal.classList.toggle('hidden', !show);
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient === 'undefined') return;
    carregarFinanceiro();
    
    document.getElementById('form-financeiro')?.addEventListener('submit', salvarTransacao);
});

async function carregarFinanceiro() {
    const user = getLoggedUser();
    const tbody = document.getElementById('lista-financeiro');
    if (!tbody || !user) return;

    try {
        const { data, error } = await supabaseClient
            .from('finances')
            .select('*, customers(name)')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });

        if (error) throw error;

        renderizarResumo(data);
        
        tbody.innerHTML = data.map(t => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm">${new Date(t.due_date).toLocaleDateString('pt-BR')}</td>
                <td class="px-6 py-4 font-medium text-slate-800">${t.description}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${t.customers?.name || '-'}</td>
                <td class="px-6 py-4 font-bold ${t.type === 'receita' ? 'text-emerald-600' : 'text-red-500'}">
                    ${t.type === 'receita' ? '+' : '-'} R$ ${t.amount.toFixed(2)}
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deletarTransacao('${t.id}')" class="text-gray-400 hover:text-red-500 transition">
                         Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar financeiro:", err.message);
    }
}

function renderizarResumo(dados) {
    const receitas = dados.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.amount, 0);
    const despesas = dados.filter(t => t.type === 'despesa').reduce((acc, t) => acc + t.amount, 0);
    const saldo = receitas - despesas;

    document.getElementById('total-receitas').innerText = `R$ ${receitas.toFixed(2)}`;
    document.getElementById('total-despesas').innerText = `R$ ${despesas.toFixed(2)}`;
    
    const saldoElement = document.getElementById('total-saldo');
    saldoElement.innerText = `R$ ${saldo.toFixed(2)}`;
    saldoElement.className = `text-2xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`;
}

async function salvarTransacao(e) {
    e.preventDefault();
    const user = getLoggedUser();
    
    const novaTransacao = {
        user_id: user.id,
        owner_email: user.email,
        description: document.getElementById('f-descricao').value,
        amount: parseFloat(document.getElementById('f-valor').value),
        type: document.getElementById('f-tipo').value,
        status: document.getElementById('f-status').value,
        due_date: document.getElementById('f-data').value,
        category: document.getElementById('f-categoria').value
    };

    const { error } = await supabaseClient.from('finances').insert([novaTransacao]);
    
    if (error) {
        alert("Erro: " + error.message);
    } else {
        toggleModal(false);
        e.target.reset();
        carregarFinanceiro();
    }
}

async function deletarTransacao(id) {
    if (!confirm("Excluir esta transação?")) return;
    await supabaseClient.from('finances').delete().eq('id', id);
    carregarFinanceiro();
}