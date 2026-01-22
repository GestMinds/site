// assets/js/inventory.js

// 1. Controle de Modais
async function toggleModal(tipo, show = true) { 
    let modalId = `modal-${tipo}`;

    if (tipo === 'entrada' || tipo === 'saida') {
        if (show) {
            const inputTipo = document.getElementById('mov-tipo');
            const title = document.getElementById('mov-title');
            const btn = document.getElementById('btn-mov-submit');

            if (inputTipo) inputTipo.value = tipo;
            if (title) title.innerText = tipo === 'entrada' ? 'Dar Entrada' : 'Dar Saída';
            
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

// 2. Carregar Dados do Banco
async function carregarTudo() {
    try {
        if (typeof supabase === 'undefined') return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Estoque
        const { data: produtos } = await supabase
            .from('products')
            .select('*')
            .eq('owner_email', user.email)
            .order('name');
        
        renderizarEstoque(produtos || []);

        // Histórico
        const { data: historico } = await supabase
            .from('stock_movements')
            .select('*, products(name)')
            .eq('owner_email', user.email)
            .order('created_at', { ascending: false })
            .limit(10);
        
        renderizarHistorico(historico || []);

    } catch (error) {
        console.error("Erro ao carregar tudo:", error);
    }
}

function renderizarEstoque(produtos) {
    const tbody = document.getElementById('lista-estoque');
    let criticos = 0;
    tbody.innerHTML = produtos.map(item => {
        const isCritico = item.current_stock <= item.min_stock;
        if (isCritico) criticos++;
        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-bold text-slate-800">${item.name}</td>
                <td class="px-6 py-4 text-gray-500">${item.sku || '-'}</td>
                <td class="px-6 py-4 font-bold ${isCritico ? 'text-red-500' : 'text-slate-700'}">${item.current_stock} ${item.unit}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded-md text-[9px] font-black uppercase ${isCritico ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}">${isCritico ? 'Crítico' : 'Normal'}</span></td>
            </tr>`;
    }).join('');
    document.getElementById('total-itens').innerText = produtos.length;
    document.getElementById('total-critico').innerText = criticos;
}

function renderizarHistorico(movimentos) {
    const tbody = document.getElementById('lista-historico');
    tbody.innerHTML = movimentos.map(m => `
        <tr class="border-b border-gray-50 text-gray-600">
            <td class="px-6 py-3">${new Date(m.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-3 font-medium">${m.products?.name || 'Excluído'}</td>
            <td class="px-6 py-3"><span class="${m.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'} font-bold uppercase text-xs">${m.type}</span></td>
            <td class="px-6 py-3 font-bold">${m.quantity}</td>
            <td class="px-6 py-3 text-xs italic">${m.reason || '-'}</td>
        </tr>`).join('');
}

// 3. Salvar Produto
document.getElementById('form-produto')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('products').insert([{
        name: document.getElementById('p-nome').value,
        sku: document.getElementById('p-codigo').value,
        unit: document.getElementById('p-unidade').value,
        current_stock: parseFloat(document.getElementById('p-inicial').value) || 0,
        min_stock: parseFloat(document.getElementById('p-min').value) || 0,
        owner_email: user.email
    }]);
    if (error) alert(error.message);
    else { toggleModal('produto', false); e.target.reset(); carregarTudo(); }
});

// 4. Salvar Movimentação
document.getElementById('form-movimentacao')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const tipo = document.getElementById('mov-tipo').value;
    const prodId = document.getElementById('mov-produto').value;
    const qtd = parseFloat(document.getElementById('mov-qtd').value);

    const { data: prod } = await supabase.from('products').select('current_stock').eq('id', prodId).single();
    const novoSaldo = tipo === 'entrada' ? prod.current_stock + qtd : prod.current_stock - qtd;

    if (novoSaldo < 0) return alert("Saldo insuficiente!");

    await supabase.from('stock_movements').insert([{
        owner_email: user.email, product_id: prodId, type: tipo, quantity: qtd, reason: document.getElementById('mov-motivo').value
    }]);
    await supabase.from('products').update({ current_stock: novoSaldo }).eq('id', prodId);

    toggleModal('movimentacao', false);
    e.target.reset();
    carregarTudo();
});

async function carregarSelectProdutos() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: prods } = await supabase.from('products').select('id, name').eq('owner_email', user.email);
    document.getElementById('mov-produto').innerHTML = '<option value="">Selecione...</option>' + 
        prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

// Inicialização com atraso de segurança para o Supabase
window.onload = () => {
    setTimeout(carregarTudo, 500); 
};