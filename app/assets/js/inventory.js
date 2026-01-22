// assets/js/inventory.js

// 1. Controle Global de Modais
async function toggleModal(tipo, show = true) { 
    let modalId = `modal-${tipo}`;

    if (tipo === 'entrada' || tipo === 'saida') {
        if (show) {
            document.getElementById('mov-tipo').value = tipo;
            document.getElementById('mov-title').innerText = tipo === 'entrada' ? 'Dar Entrada' : 'Dar Saída';
            
            const btn = document.getElementById('btn-mov-submit');
            btn.className = tipo === 'entrada' 
                ? 'w-full p-4 rounded-2xl font-bold text-white transition shadow-lg mt-4 bg-emerald-600 hover:bg-emerald-700'
                : 'w-full p-4 rounded-2xl font-bold text-white transition shadow-lg mt-4 bg-red-500 hover:bg-red-600';
            
            await carregarSelectProdutos();
        }
        modalId = 'modal-movimentacao';
    }

    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}

// 2. Função Unificada para Carregar os Dados (Estoque + Histórico)
async function carregarTudo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // A. Carregar Estoque Atual
    const { data: produtos, error: errProd } = await supabase
        .from('products')
        .select('*')
        .eq('owner_email', user.email)
        .order('name', { ascending: true });

    if (errProd) console.error("Erro produtos:", errProd);
    else renderizarEstoque(produtos);

    // B. Carregar Histórico de Movimentações (Relacionando com a tabela de produtos)
    const { data: historico, error: errHist } = await supabase
        .from('stock_movements')
        .select('*, products(name)')
        .eq('owner_email', user.email)
        .order('created_at', { ascending: false })
        .limit(10); // Mostra os 10 últimos

    if (errHist) console.error("Erro histórico:", errHist);
    else renderizarHistorico(historico);
}

function renderizarEstoque(produtos) {
    const tbody = document.getElementById('lista-estoque');
    const totalItensEl = document.getElementById('total-itens');
    const totalCriticoEl = document.getElementById('total-critico');
    
    tbody.innerHTML = '';
    let criticos = 0;

    produtos.forEach(item => {
        const isCritico = item.current_stock <= item.min_stock;
        if (isCritico) criticos++;

        tbody.innerHTML += `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <p class="font-bold text-slate-800">${item.name}</p>
                    <p class="text-[10px] text-gray-400 uppercase font-bold">${item.brand || 'S/ Marca'}</p>
                </td>
                <td class="px-6 py-4 text-gray-500">${item.sku || '-'}</td>
                <td class="px-6 py-4 font-bold ${isCritico ? 'text-red-500' : 'text-slate-700'}">
                    ${item.current_stock} <span class="text-[10px] font-normal text-gray-400">${item.unit}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-md text-[9px] font-black uppercase ${isCritico ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}">
                        ${isCritico ? 'Crítico' : 'Normal'}
                    </span>
                </td>
            </tr>`;
    });

    totalItensEl.innerText = produtos.length;
    totalCriticoEl.innerText = criticos;
}

function renderizarHistorico(movimentos) {
    const tbody = document.getElementById('lista-historico');
    tbody.innerHTML = movimentos.map(m => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition text-gray-600">
            <td class="px-6 py-3 text-[11px]">${new Date(m.created_at).toLocaleString('pt-BR')}</td>
            <td class="px-6 py-3 font-semibold text-slate-700">${m.products?.name || 'Produto Excluído'}</td>
            <td class="px-6 py-3">
                <span class="font-bold text-[10px] ${m.type === 'entrada' ? 'text-emerald-500' : 'text-red-500'}">
                    ${m.type === 'entrada' ? '↑ ENTRADA' : '↓ SAÍDA'}
                </span>
            </td>
            <td class="px-6 py-3 font-bold">${m.quantity}</td>
            <td class="px-6 py-3 text-xs italic text-gray-400">${m.reason || '-'}</td>
        </tr>
    `).join('');
}

// 3. Cadastro de Produto
const formProduto = document.getElementById('form-produto');
if (formProduto) {
    formProduto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();

        const produtoData = {
            name: document.getElementById('p-nome').value,
            sku: document.getElementById('p-codigo').value,
            brand: document.getElementById('p-marca').value,
            unit: document.getElementById('p-unidade').value,
            current_stock: parseFloat(document.getElementById('p-inicial').value) || 0,
            min_stock: parseFloat(document.getElementById('p-min').value) || 0,
            max_stock: parseFloat(document.getElementById('p-max').value) || 100,
            owner_email: user.email
        };

        const { error } = await supabase.from('products').insert([produtoData]);
        if (error) return alert("Erro ao salvar: " + error.message);

        formProduto.reset();
        toggleModal('produto', false);
        carregarTudo();
    });
}

// 4. Cadastro de Movimentação
const formMovimentacao = document.getElementById('form-movimentacao');
if (formMovimentacao) {
    formMovimentacao.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        
        const tipo = document.getElementById('mov-tipo').value;
        const productId = document.getElementById('mov-produto').value;
        const qtd = parseFloat(document.getElementById('mov-qtd').value);
        const motivo = document.getElementById('mov-motivo').value;

        // Buscar saldo atual para o Kardex
        const { data: prod } = await supabase.from('products').select('current_stock').eq('id', productId).single();
        const novoSaldo = tipo === 'entrada' ? prod.current_stock + qtd : prod.current_stock - qtd;

        if (novoSaldo < 0) return alert("Atenção: Saldo insuficiente no estoque!");

        // Gravar histórico e atualizar saldo em paralelo
        await Promise.all([
            supabase.from('stock_movements').insert([{
                owner_email: user.email, product_id: productId, type: tipo,
                quantity: qtd, reason: motivo, previous_stock: prod.current_stock, after_stock: novoSaldo
            }]),
            supabase.from('products').update({ current_stock: novoSaldo }).eq('id', productId)
        ]);

        formMovimentacao.reset();
        toggleModal('movimentacao', false);
        carregarTudo();
    });
}

// 5. Auxiliar: Carregar Select de Produtos
async function carregarSelectProdutos() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: produtos } = await supabase.from('products').select('id, name').eq('owner_email', user.email).order('name');
    const select = document.getElementById('mov-produto');
    select.innerHTML = '<option value="">Selecione...</option>' + 
        produtos.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

// Inicialização
document.addEventListener('DOMContentLoaded', carregarTudo);