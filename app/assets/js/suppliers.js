// assets/js/suppliers.js

function getLoggedSupplierUser() {
    const userData = localStorage.getItem('@GestMinds:user');
    return userData ? JSON.parse(userData) : null;
}

// Voltamos para o nome que o HTML espera: toggleModal
function toggleModal(show) {
    const modal = document.getElementById('modal-fornecedor');
    if (modal) {
        modal.classList.toggle('hidden', !show);
    } else {
        console.error("Elemento 'modal-fornecedor' não encontrado no HTML.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient === 'undefined') return;
    listarFornecedores();

    const form = document.getElementById('form-fornecedor');
    if (form) {
        form.removeEventListener('submit', salvarFornecedor);
        form.addEventListener('submit', salvarFornecedor);
    }
});

async function listarFornecedores() {
    const user = getLoggedSupplierUser();
    const tbody = document.getElementById('lista-fornecedores');
    if (!tbody || !user) return;

    try {
        const { data, error } = await supabaseClient
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'fornecedor')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-20 text-center">
                <div class="flex flex-col items-center">
                    <span class="text-4xl mb-4">📦</span>
                    <p class="text-gray-400 italic">Nenhum fornecedor cadastrado ainda.</p>
                </div>
            </td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(f => `
            <tr class="border-b border-gray-100 hover:bg-gray-50/50 transition group">
                <td class="px-6 py-5">
                    <div class="font-bold text-slate-800">${f.name}</div>
                    <div class="text-xs text-gray-400">${f.email || 'Sem e-mail'} • ${f.phone || ''}</div>
                </td>
                <td class="px-6 py-5">
                    <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                        ${f.document || '---'}
                    </span>
                </td>
                <td class="px-6 py-5 text-center">
                    <button onclick="deletarFornecedor('${f.id}')" class="text-red-400 hover:text-red-600 text-sm font-bold transition">
                        Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro:", err.message);
    }
}

async function salvarFornecedor(e) {
    e.preventDefault();
    const user = getLoggedSupplierUser();
    const btn = document.getElementById('btn-salvar');
    if (btn) { btn.innerText = 'Processando...'; btn.disabled = true; }

    try {
        const novoFornecedor = {
            user_id: user.id,
            owner_email: user.email,
            type: 'fornecedor',
            name: document.getElementById('f-nome').value,
            email: document.getElementById('f-email').value,
            phone: document.getElementById('f-tel').value,
            document: document.getElementById('f-doc').value
        };

        const { error } = await supabaseClient.from('customers').insert([novoFornecedor]);
        if (error) throw error;

        document.getElementById('form-fornecedor').reset();
        toggleModal(false); // Fechar o modal
        await listarFornecedores();
    } catch (err) {
        alert("Erro: " + err.message);
    } finally {
        if (btn) { btn.innerText = 'Confirmar Cadastro'; btn.disabled = false; }
    }
}

async function deletarFornecedor(id) {
    const user = getLoggedSupplierUser();
    if (confirm("Deseja remover este fornecedor?")) {
        await supabaseClient.from('customers').delete().eq('id', id).eq('user_id', user.id);
        listarFornecedores();
    }
}