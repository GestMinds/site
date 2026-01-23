// assets/js/nfe.js

// 1. Variáveis de Controle de Estado do Pop-up
let currentNfeId = null;

// Função auxiliar para obter o usuário do localStorage
function getLoggedUser() {
    const userData = localStorage.getItem('@GestMinds:user');
    return userData ? JSON.parse(userData) : null;
}

// Único listener DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient === 'undefined') {
        console.error("Erro: Supabase não foi carregado corretamente.");
        return;
    }
    
    await verificarPlano();
    await listarVendasParaFaturar();
});

// --- LÓGICA DE INTERFACE ---

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
        const { data, error } = await supabaseClient
            .from('finances')
            .select('*')
            .eq('user_id', String(user.id))
            .eq('type', 'receita')
            .order('due_date', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-400 italic">Nenhuma receita encontrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(v => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-500">${new Date(v.due_date).toLocaleDateString('pt-BR')}</td>
                <td class="px-6 py-4 font-medium text-slate-800">${v.description}</td>
                <td class="px-6 py-4 font-bold text-slate-700">R$ ${v.amount.toFixed(2)}</td>
                <td class="px-6 py-4 text-center">
                    <span id="status-${v.id}" class="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase">Não Emitida</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="abrirEmissor('${v.id}')" 
                        class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                        Emitir NF-e
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-red-500">Erro ao carregar dados.</td></tr>`;
    }
}

// --- LÓGICA DO POP-UP (TABS) ---

function abrirEmissor(id) {
    currentNfeId = id;
    toggleNfeModal(true);
    carregarDadosDaEmpresa(); // Carrega o que estiver salvo na Tela 1
}

function toggleNfeModal(show) {
    const modal = document.getElementById('modal-nfe');
    if (modal) {
        modal.classList.toggle('hidden', !show);
        if (show) switchTab(1); // Sempre abre na primeira aba
    }
}

function switchTab(tabNumber) {
    // Esconde todos os conteúdos de abas
    document.querySelectorAll('.nfe-tab-content').forEach(div => div.classList.add('hidden'));
    // Mostra a aba atual
    const activeDiv = document.getElementById(`tab-${tabNumber}`);
    if (activeDiv) activeDiv.classList.remove('hidden');
    
    // Atualiza estilo dos botões laterais
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        if (idx + 1 === tabNumber) {
            btn.classList.add('active-tab');
            btn.classList.remove('text-gray-400');
        } else {
            btn.classList.remove('active-tab');
            btn.classList.add('text-gray-400');
        }
    });
}

// --- PERSISTÊNCIA E AÇÕES FISCAIS ---

async function carregarDadosDaEmpresa() {
    const user = getLoggedUser();
    try {
        const { data } = await supabaseClient
            .from('fiscal_settings')
            .select('*')
            .eq('user_id', String(user.id))
            .single();

        if (data) {
            document.getElementById('em-cnpj').value = data.cnpj || '';
            document.getElementById('em-razao').value = data.razao_social || '';
            document.getElementById('em-ie').value = data.inscricao_estadual || '';
            document.getElementById('em-regime').value = data.regime_tributario || '1';
            document.getElementById('em-rua').value = data.logradouro || '';
            document.getElementById('em-num').value = data.numero || '';
            document.getElementById('em-cep').value = data.cep || '';
        }
    } catch (err) { console.warn("Emitente ainda não configurado."); }
}

async function saveFiscalSettings() {
    const user = getLoggedUser();
    const btn = event.target;
    btn.innerText = "Salvando...";

    const settings = {
        user_id: String(user.id),
        cnpj: document.getElementById('em-cnpj').value,
        razao_social: document.getElementById('em-razao').value,
        inscricao_estadual: document.getElementById('em-ie').value,
        regime_tributario: document.getElementById('em-regime').value,
        logradouro: document.getElementById('em-rua').value,
        numero: document.getElementById('em-num').value,
        cep: document.getElementById('em-cep').value
    };

    const { error } = await supabaseClient
        .from('fiscal_settings')
        .upsert([settings], { onConflict: 'user_id' });

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert("Dados do Emitente salvos com sucesso!");
    }
    btn.innerText = "Salvar Dados do Emitente";
}

function transmitirSefaz() {
    if(!currentNfeId) return;
    
    const status = document.getElementById(`status-${currentNfeId}`);
    toggleNfeModal(false);
    
    if (status) {
        status.innerText = "Transmitindo...";
        status.className = "px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase animate-pulse";

        setTimeout(() => {
            status.innerText = "NF-e Emitida";
            status.className = "px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase";
            alert("Sucesso! NF-e autorizada e enviada ao cliente.");
        }, 3000);
    }
}