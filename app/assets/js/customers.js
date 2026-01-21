// assets/js/customers.js

/**
 * NOTA: As variáveis SUPABASE_URL e SUPABASE_ANON_KEY NÃO devem ser declaradas aqui
 * pois já foram declaradas no seu arquivo auth.js. 
 * O navegador compartilha essas variáveis entre todos os scripts da página.
 */

// Inicializamos o cliente apenas se ele ainda não estiver disponível globalmente
if (typeof _supabase === 'undefined') {
    var _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const user = JSON.parse(localStorage.getItem('@GestMinds:user'));

// Função para abrir e fechar o modal (agora vai funcionar!)
function toggleModal(show) {
    const modal = document.getElementById('modal-cliente');
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}

// Garante que o script rode após o HTML carregar
document.addEventListener('DOMContentLoaded', () => {
    listarClientes();

    // Vincula o evento de submit ao formulário
    const form = document.getElementById('form-cliente');
    if (form) {
        form.addEventListener('submit', salvarCliente);
    }
});

async function listarClientes() {
    const tbody = document.getElementById('lista-clientes');
    if (!tbody) return;

    try {
        const { data, error } = await _supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'cliente')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-gray-400 italic">Nenhum cliente encontrado.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(cli => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-medium text-slate-800">${cli.name}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${cli.email || '-'} <br> <span class="text-xs text-gray-400">${cli.phone || ''}</span></td>
                <td class="px-6 py-4 text-sm text-gray-600">${cli.document || '-'}</td>
                <td class="px-6 py-4">
                    <button onclick="deletarCliente('${cli.id}')" class="text-red-400 hover:text-red-600 text-sm">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro ao listar:", err.message);
    }
}

async function salvarCliente(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar');
    btn.innerText = 'Salvando...';
    btn.disabled = true;

    try {
        const novoCliente = {
            user_id: user.id, 
            owner_email: user.email,
            type: 'cliente',
            name: document.getElementById('c-nome').value,
            email: document.getElementById('c-email').value,
            phone: document.getElementById('c-tel').value,
            document: document.getElementById('c-doc').value
        };

        const { error } = await _supabase.from('customers').insert([novoCliente]);

        if (error) throw error;

        document.getElementById('form-cliente').reset();
        toggleModal(false);
        await listarClientes(); 

    } catch (err) {
        alert("Erro ao salvar: " + err.message);
    } finally {
        btn.innerText = 'Salvar Cliente';
        btn.disabled = false;
    }
}

async function deletarCliente(id) {
    if (confirm("Deseja realmente excluir este cliente?")) {
        try {
            const { error } = await _supabase
                .from('customers')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); 

            if (error) throw error;
            await listarClientes();
        } catch (err) {
            alert("Erro ao deletar: " + err.message);
        }
    }
}