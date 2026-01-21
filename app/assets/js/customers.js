// assets/js/customers.js
const SUPABASE_URL = 'https://dduistcgwxuiciyqeidd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWlzdGNnd3h1aWNpeXFlaWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTc3MzYsImV4cCI6MjA4NDE5MzczNn0.is6SOIkl-nbhsDTy4W7sUoHrQGSTZdyFL_dlAOhnG8g'; // Use a mesma que você já tem
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const user = JSON.parse(localStorage.getItem('@GestMinds:user'));

// Abrir/Fechar Modal
function toggleModal(show) {
    document.getElementById('modal-cliente').classList.toggle('hidden', !show);
}

// Carregar Clientes ao abrir a página
document.addEventListener('DOMContentLoaded', listarClientes);

async function listarClientes() {
    const tbody = document.getElementById('lista-clientes');
    
    const { data, error } = await _supabase
        .from('customers')
        .select('*')
        .eq('owner_email', user.email)
        .eq('type', 'cliente')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    if (data.length === 0) {
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
}

// Salvar Cliente
document.getElementById('form-cliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar');
    btn.innerText = 'Salvando...';
    btn.disabled = true;

    const novoCliente = {
        owner_email: user.email,
        type: 'cliente',
        name: document.getElementById('c-nome').value,
        email: document.getElementById('c-email').value,
        phone: document.getElementById('c-tel').value,
        document: document.getElementById('c-doc').value
    };

    const { error } = await _supabase.from('customers').insert([novoCliente]);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        document.getElementById('form-cliente').reset();
        toggleModal(false);
        listarClientes(); // Atualiza a lista
    }
    
    btn.innerText = 'Salvar Cliente';
    btn.disabled = false;
});

// Função para deletar (Opcional, mas útil)
async function deletarCliente(id) {
    if (confirm("Deseja realmente excluir este cliente?")) {
        await _supabase.from('customers').delete().eq('id', id);
        listarClientes();
    }
}