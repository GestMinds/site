// assets/js/rh.js

// 1. Tornar as funções globais logo de cara para o HTML não se perder
window.toggleModalRH = function(show) {
    const modal = document.getElementById('modal-rh');
    if (modal) modal.classList.toggle('hidden', !show);
};

window.deletarFuncionario = async function(id) {
    if (confirm("⚠️ ATENÇÃO: Deseja realmente processar a demissão/exclusão deste colaborador?")) {
        const { error } = await supabaseClient.from('employees').delete().eq('id', id);
        if (error) alert("Erro ao excluir: " + error.message);
        else listarFuncionarios();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Tenta listar, mas se a tabela não existir, não trava o resto do sistema
    listarFuncionarios().catch(e => console.error("Aguardando tabela no Supabase..."));
    
    if (document.getElementById('rh-cpf')) {
        IMask(document.getElementById('rh-cpf'), { mask: '000.000.000-00' });
    }

    // Listener do Formulário
    const form = document.getElementById('form-rh');
    if (form) {
        form.addEventListener('submit', salvarFuncionario);
    }
});

async function listarFuncionarios() {
    const userData = JSON.parse(localStorage.getItem('@GestMinds:user'));
    const tbody = document.getElementById('lista-funcionarios');
    
    if (!tbody || !userData) return;

    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .select('*')
            .eq('user_id', userData.id)
            .order('name', { ascending: true });

        // Se der erro de tabela não encontrada, o catch vai pegar
        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-400 italic">Nenhum funcionário cadastrado.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(emp => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">${emp.name}</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-tighter">${emp.cpf || 'Sem CPF'}</div>
                </td>
                <td class="px-6 py-4 text-sm">
                    <div class="text-slate-700 font-medium">${emp.position}</div>
                    <div class="text-[10px] font-bold text-blue-500 uppercase">${emp.department}</div>
                </td>
                <td class="px-6 py-4 font-bold text-slate-700">
                    R$ ${Number(emp.salary).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${emp.admission_date ? new Date(emp.admission_date).toLocaleDateString('pt-BR') : '---'}
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deletarFuncionario('${emp.id}')" class="text-red-400 hover:text-red-600 transition font-black text-xs uppercase">
                        Demitir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.warn("Tabela employees ainda não acessível.");
        tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-amber-600 bg-amber-50">Configure a tabela 'employees' no Supabase para listar.</td></tr>`;
    }
}

async function salvarFuncionario(e) {
    e.preventDefault();
    
    // Pega o usuário do localStorage (verifique se a chave está correta)
    const rawUser = localStorage.getItem('@GestMinds:user');
    if (!rawUser) return alert("Erro: Usuário não logado.");
    
    const userData = JSON.parse(rawUser);

    // LOG DE DEBUG - Veja se o ID aqui é um UUID ou apenas um número
    console.log("ID do Usuário logado:", userData.id);

    const novoFunc = {
        // Se o seu banco for o Supabase Auth, o user_id PRECISA ser o UUID.
        // Se você estiver usando um banco customizado com IDs numéricos, 
        // a tabela no SQL tem que ser 'int' e não 'uuid'.
        user_id: userData.id, 
        name: document.getElementById('rh-nome').value,
        cpf: document.getElementById('rh-cpf').value,
        position: document.getElementById('rh-cargo').value,
        department: document.getElementById('rh-depto').value,
        salary: parseFloat(document.getElementById('rh-salario').value) || 0,
        admission_date: document.getElementById('rh-admissao').value || new Date().toISOString().split('T')[0]
    };

    console.log("Tentando salvar:", novoFunc); // Isso vai te mostrar se o user_id está vindo nulo

    try {
        const { error } = await supabaseClient.from('employees').insert([novoFunc]);
        if (error) throw error;

        window.toggleModalRH(false);
        listarFuncionarios();
        e.target.reset();
    } catch (err) {
        alert("Erro ao salvar: Verifique se a tabela 'employees' foi criada no Supabase SQL Editor.");
    } finally {
        btn.innerText = "Salvar Contratação";
        btn.disabled = false;
    }
}