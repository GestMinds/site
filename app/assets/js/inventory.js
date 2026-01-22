// assets/js/inventory.js

const user = JSON.parse(localStorage.getItem('@GestMinds:user'));

// Gerenciamento de Modais Dinâmico
async function toggleModal(tipo, show) {
    // Se o tipo for entrada ou saída, preparamos o modal de movimentação
    if (tipo === 'entrada' || tipo === 'saida') {
        if (show) {
            document.getElementById('mov-tipo').value = tipo;
            document.getElementById('mov-title').innerText = tipo === 'entrada' ? 'Dar Entrada' : 'Dar Saída';
            const btn = document.getElementById('btn-mov-submit');
            
            // Estilo dinâmico do botão conforme a operação
            btn.className = tipo === 'entrada' 
                ? 'w-full p-4 rounded-2xl font-bold text-white transition shadow-lg mt-4 bg-emerald-600 hover:bg-emerald-700'
                : 'w-full p-4 rounded-2xl font-bold text-white transition shadow-lg mt-4 bg-red-500 hover:bg-red-600';
            
            await carregarSelectProdutos();
        }
        tipo = 'movimentacao'; 
    }

    const modal = document.getElementById(`modal-${tipo}`);
    if (modal) modal.classList.toggle('hidden', !show);
}

// Carrega os produtos no select do modal de movimentação
async function carregarSelectProdutos() {
    const select = document.getElementById('mov-produto');
    try {
        const { data, error } = await _supabase
            .from('products')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (data) {
            select.innerHTML = '<option value="">Selecione um produto...</option>' + 
                data.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    } catch (err) {
        console.error("Erro ao carregar select:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof _supabase === 'undefined') return;
    listarEstoque();
    
    // Vincula o formulário de novo produto
    document.getElementById('form-produto')?.addEventListener('submit', salvarProduto);
    
    // Vincula o formulário de movimentação
    document.getElementById('form-movimentacao')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('mov-tipo').value;
        const prodId = document.getElementById('mov-produto').value;
        const qtd = document.getElementById('mov-qtd').value;
        const motivo = document.getElementById('mov-motivo').value;

        const sucesso = await registrarMovimentacao(tipo, prodId, qtd, motivo);
        if (sucesso) {
            toggleModal('movimentacao', false);
            e.target.reset();
        }
    });
});

async function listarEstoque() {
    const tbody = document.getElementById('lista-estoque');
    if (!tbody || !user) return;

    try {
        const { data, error } = await _supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (error) throw error;

        let criticos = 0;
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-gray-400">Nenhum produto em estoque.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(prod => {
            const isCritico = prod.current_stock <= prod.min_stock;
            if (isCritico) criticos++;

            return `
                <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td class="px-6 py-4">
                        <div class="font-bold text-slate-800">${prod.name}</div>
                        <div class="text-xs text-gray-400">${prod.brand || 'Sem marca'} • ${prod.unit}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 font-mono">${prod.internal_code || '---'}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <span class="text-lg font-black ${isCritico ? 'text-red-500' : 'text-slate-700'}">
                                ${prod.current_stock}
                            </span>
                            <span class="text-xs text-gray-400">/ min: ${prod.min_stock}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        ${isCritico 
                            ? '<span class="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Estoque Crítico</span>' 
                            : '<span class="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Normal</span>'}
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('total-itens').innerText = data.length;
        document.getElementById('total-critico').innerText = criticos;

    } catch (err) {
        console.error("Erro ao listar estoque:", err.message);
    }
}

async function salvarProduto(e) {
    e.preventDefault();
    const btn = e.submitter;
    btn.disabled = true;
    btn.innerText = 'Gravando...';

    const novoProduto = {
        user_id: user.id,
        internal_code: document.getElementById('p-codigo').value,
        name: document.getElementById('p-nome').value,
        unit: document.getElementById('p-unidade').value,
        min_stock: parseFloat(document.getElementById('p-min').value) || 0,
        max_stock: parseFloat(document.getElementById('p-max').value) || 0,
        current_stock: parseFloat(document.getElementById('p-inicial').value) || 0,
        brand: document.getElementById('p-marca').value
    };

    try {
        const { error } = await _supabase.from('products').insert([novoProduto]);
        if (error) throw error;
        toggleModal('produto', false);
        e.target.reset();
        await listarEstoque();
    } catch (err) {
        alert("Erro ao cadastrar: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Salvar Produto';
    }
}

async function registrarMovimentacao(tipo, produtoId, qtd, motivo) {
    try {
        const { data: prod, error: errFetch } = await _supabase
            .from('products')
            .select('current_stock')
            .eq('id', produtoId)
            .single();

        if (errFetch) throw errFetch;

        const novoSaldo = tipo === 'entrada' 
            ? parseFloat(prod.current_stock) + parseFloat(qtd)
            : parseFloat(prod.current_stock) - parseFloat(qtd);

        if (novoSaldo < 0) {
            alert("Operação negada: Estoque insuficiente.");
            return false;
        }

        // 1. Histórico
        const { error: errMov } = await _supabase.from('stock_movements').insert([{
            user_id: user.id,
            product_id: produtoId,
            type: tipo,
            quantity: qtd,
            reason: motivo,
            responsible_name: user.name
        }]);

        if (errMov) throw errMov;

        // 2. Atualiza Saldo
        await _supabase.from('products').update({ current_stock: novoSaldo }).eq('id', produtoId);
        
        await listarEstoque();
        return true;
    } catch (err) {
        alert("Erro no estoque: " + err.message);
        return false;
    }
}