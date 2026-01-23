// assets/js/nfe.js

// Função auxiliar para obter o usuário do localStorage
function getLoggedUser() {
    const userData = localStorage.getItem('@GestMinds:user');
    return userData ? JSON.parse(userData) : null;
}

// Único listener DOMContentLoaded para evitar conflitos
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient === 'undefined') {
        console.error("Erro: Supabase não foi carregado corretamente.");
        return;
    }
    
    // Executa as verificações em ordem
    await verificarPlano();
    await listarVendasParaFaturar();
});

async function verificarPlano() {
    const user = getLoggedUser();
    if (!user || !user.id) return;

    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('plan_type')
            .eq('id', String(user.id))
            .single();

        if (error) throw error;

        const alerta = document.getElementById('alerta-plano');
        if (alerta && data) {
            // Só exibe se o texto for EXATAMENTE "GestMinds Essencial"
            if (data.plan_type === 'GestMinds Essencial') {
                alerta.classList.remove('hidden');
            } else {
                alerta.classList.add('hidden');
            }
        }
    } catch (err) {
        console.error("Erro ao verificar plano:", err.message);
    }
}

async function listarVendasParaFaturar() {
    const user = getLoggedUser();
    const tbody = document.getElementById('lista-faturamento');
    
    if (!tbody || !user) return;

    try {
        // Busca apenas entradas de dinheiro (receita)
        const { data, error } = await supabaseClient
            .from('finances')
            .select('*')
            .eq('user_id', String(user.id))
            .eq('type', 'receita')
            .order('due_date', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-10 text-center text-gray-400 italic">
                        Nenhuma receita encontrada para faturamento.
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = data.map(v => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-500">${new Date(v.due_date).toLocaleDateString('pt-BR')}</td>
                <td class="px-6 py-4 font-medium text-slate-800">${v.description}</td>
                <td class="px-6 py-4 font-bold text-slate-700">R$ ${v.amount.toFixed(2)}</td>
                <td class="px-6 py-4 text-center">
                    <span id="status-${v.id}" class="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase">
                        Não Emitida
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button id="btn-${v.id}" onclick="simularEmissao('${v.id}')" 
                        class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                        Emitir NF-e
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Erro ao carregar faturamento:", err.message);
        tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-red-500">Erro ao carregar dados financeiros.</td></tr>`;
    }
}

async function simularEmissao(id) {
    const btn = document.getElementById(`btn-${id}`);
    const status = document.getElementById(`status-${id}`);
    
    if (!btn || !status) return;

    btn.disabled = true;
    btn.innerText = "Processando...";
    status.innerText = "Comunicando SEFAZ...";
    status.className = "px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase animate-pulse";

    // Simulação visual de 2.5 segundos
    setTimeout(() => {
        status.innerText = "NF-e Emitida";
        status.className = "px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase";
        btn.innerText = "Visualizar PDF";
        btn.onclick = () => alert("O PDF da nota está sendo gerado e será enviado para o e-mail do cliente.");
        btn.disabled = false;
    }, 2500);
}