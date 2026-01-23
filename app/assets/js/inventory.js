// assets/js/inventory.js

// Função para pegar os dados do usuário que você salvou no localStorage no auth.js
function getLoggedUser() {
    const userData = localStorage.getItem('@GestMinds:user');
    if (!userData) return null;
    return JSON.parse(userData);
}

// 1. Controle de Modais (Abre e fecha as janelas)
async function toggleModal(tipo, show = true) { 
    let modalId = `modal-${tipo}`;

    if (tipo === 'entrada' || tipo === 'saida') {
        if (show) {
            document.getElementById('mov-tipo').value = tipo;
            document.getElementById('mov-title').innerText = tipo === 'entrada' ? 'Dar Entrada' : 'Dar Saída';
            
            const btn = document.getElementById('btn-mov-submit');
            if (btn) {
                btn.className = tipo === 'entrada' 
                    ? 'w-full p-4 rounded-2xl font-bold text-white transition shadow-lg mt-4 bg-emerald-600 hover:bg-emerald-700'
                    : 'w-full p-4 rounded-2xl font-bold text-white transition shadow-lg mt-4 bg-red-500 hover:bg-red-600';
            }
            await carregarSelectProdutos();
        }
        modalId = 'modal-movimentacao';
    }

    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}

// 2. Carregar Tudo (Estoque + Histórico)
async function carregarTudo() {
    const user = getLoggedUser();
    if (!user) return console.error("Usuário não identificado.");

    try {
        // A. Buscar Estoque Atual usando supabaseClient
        const { data: produtos, error: errProd } = await supabaseClient
            .from('products')
            .select('*')
            .eq('owner_email', user.email)
            .order('name', { ascending: true });

        if (errProd) throw errProd;
        renderizarEstoque(produtos || []);

        // B. Buscar Histórico (Kardex) usando supabaseClient
        const { data: historico, error: errHist } = await supabaseClient
            .from('stock_movements')
            .select('*, products(name)')
            .eq('owner_email', user.email)
            .order('created_at', { ascending: false })
            .limit(10);

        if (errHist) throw errHist;
        renderizarHistorico(historico || []);

    } catch (error) {
        console.error("Erro na busca de dados:", error.message);
    }
}

// 3. Renderizar Tabela de Estoque
function renderizarEstoque(produtos) {
    const tbody = document.getElementById('lista-estoque');
    if (!tbody) return;

    let criticos = 0;
    tbody.innerHTML = '';

    produtos.forEach(item => {
        const isCritico = item.current_stock <= item.min_stock;
        if (isCritico) criticos++;

        tbody.innerHTML += `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-bold text-slate-800">${item.name}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.sku || '-'}</td>
                <td class="px-6 py-4 font-bold ${isCritico ? 'text-red-500' : 'text-slate-700'}">
                    ${item.current_stock} <span class="text-[10px] font-normal text-gray-400">${item.unit}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="px-2 py-1 rounded-md text-[9px] font-black uppercase ${isCritico ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}">
                        ${isCritico ? 'Crítico' : 'Normal'}
                    </span>
                </td>
            </tr>`;
    });

    document.getElementById('total-itens').innerText = produtos.length;
    document.getElementById('total-critico').innerText = criticos;
}

// 4. Renderizar Tabela de Histórico
function renderizarHistorico(movimentos) {
    const tbody = document.getElementById('lista-historico');
    if (!tbody) return;

    tbody.innerHTML = movimentos.map(m => `
        <tr class="border-b border-gray-50 text-gray-600">
            <td class="px-6 py-3 text-xs">${new Date(m.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-3 font-medium text-slate-700">${m.products?.name || 'Excluído'}</td>
            <td class="px-6 py-3">
                <span class="font-bold text-[10px] uppercase ${m.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}">
                    ${m.type}
                </span>
            </td>
            <td class="px-6 py-3 font-bold">${m.quantity}</td>
            <td class="px-6 py-3 text-xs italic text-gray-400">${m.reason || '-'}</td>
        </tr>
    `).join('');
}

// 5. Salvar Novo Produto
document.getElementById('form-produto')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getLoggedUser();

    const data = {
        name: document.getElementById('p-nome').value,
        sku: document.getElementById('p-codigo').value,
        unit: document.getElementById('p-unidade').value,
        current_stock: parseFloat(document.getElementById('p-inicial').value) || 0,
        min_stock: parseFloat(document.getElementById('p-min').value) || 0,
        owner_email: user.email
    };

    const { error } = await supabaseClient.from('products').insert([data]);
    if (error) return alert("Erro ao cadastrar: " + error.message);

    toggleModal('produto', false);
    e.target.reset();
    carregarTudo();
});

// 6. Salvar Movimentação (Entrada/Saída)
document.getElementById('form-movimentacao')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getLoggedUser();
    const tipo = document.getElementById('mov-tipo').value;
    const prodId = document.getElementById('mov-produto').value;
    const qtd = parseFloat(document.getElementById('mov-qtd').value);

    // 1. Pegar saldo atual usando supabaseClient
    const { data: prod } = await supabaseClient.from('products').select('current_stock').eq('id', prodId).single();
    const novoSaldo = tipo === 'entrada' ? prod.current_stock + qtd : prod.current_stock - qtd;

    if (novoSaldo < 0) return alert("Atenção: Saldo insuficiente!");

    // 2. Gravar histórico e atualizar saldo usando supabaseClient
    await supabaseClient.from('stock_movements').insert([{
        owner_email: user.email, product_id: prodId, type: tipo, 
        quantity: qtd, reason: document.getElementById('mov-motivo').value
    }]);

    await supabaseClient.from('products').update({ current_stock: novoSaldo }).eq('id', prodId);

    toggleModal('movimentacao', false);
    e.target.reset();
    carregarTudo();
});

// 7. Auxiliar: Carregar o Select com produtos da empresa
async function carregarSelectProdutos() {
    const user = getLoggedUser();
    const { data: prods } = await supabaseClient.from('products').select('id, name').eq('owner_email', user.email).order('name');
    const select = document.getElementById('mov-produto');
    if (select) {
        select.innerHTML = '<option value="">Selecione...</option>' + 
            prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', carregarTudo);