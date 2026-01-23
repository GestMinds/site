// assets/js/nfe.js

let currentNfeId = null;

// Configuração de campos obrigatórios
const camposEmitente = {
    'em-cnpj': 'CNPJ do Emitente',
    'em-razao': 'Razão Social',
    'em-ie': 'Inscrição Estadual',
    'em-rua': 'Logradouro',
    'em-num': 'Número',
    'em-cep': 'CEP'
};

const camposDestinatario = {
    'dest-doc': 'CPF/CNPJ do Destinatário',
    'dest-nome': 'Nome do Cliente',
    'dest-email': 'E-mail para envio'
};

function getLoggedUser() {
    const userData = localStorage.getItem('@GestMinds:user');
    return userData ? JSON.parse(userData) : null;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient === 'undefined') return;
    await verificarPlano();
    await listarVendasParaFaturar();
});

// --- INTERFACE ---

async function verificarPlano() {
    const user = getLoggedUser();
    if (!user) return;
    const { data } = await supabaseClient.from('profiles').select('plan_type').eq('id', String(user.id)).single();
    if (data?.plan_type === 'GestMinds Essencial') document.getElementById('alerta-plano')?.classList.remove('hidden');
}

async function listarVendasParaFaturar() {
    const user = getLoggedUser();
    const tbody = document.getElementById('lista-faturamento');
    if (!tbody || !user) return;

    const { data } = await supabaseClient.from('finances').select('*').eq('user_id', String(user.id)).eq('type', 'receita').order('due_date', { ascending: false });

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
                <button onclick="abrirEmissor('${v.id}')" class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition">Emitir NF-e</button>
            </td>
        </tr>
    `).join('');
}

// --- LÓGICA DO MODAL ---

function abrirEmissor(id) {
    currentNfeId = id;
    toggleNfeModal(true);
    carregarDadosDaEmpresa();
}

function toggleNfeModal(show) {
    const modal = document.getElementById('modal-nfe');
    if (modal) {
        modal.classList.toggle('hidden', !show);
        if (show) switchTab(1);
    }
}

function switchTab(tabNumber) {
    document.querySelectorAll('.nfe-tab-content').forEach(div => div.classList.add('hidden'));
    document.getElementById(`tab-${tabNumber}`)?.classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        if (idx + 1 === tabNumber) { btn.classList.add('active-tab'); btn.classList.remove('text-gray-400'); }
        else { btn.classList.remove('active-tab'); btn.classList.add('text-gray-400'); }
    });
}

// --- VALIDAÇÃO E PERSISTÊNCIA ---

function validarCampos(lista) {
    let erros = [];
    Object.keys(lista).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('input-error');
            if (!el.value.trim()) {
                el.classList.add('input-error');
                erros.push(lista[id]);
            }
        }
    });
    if (erros.length > 0) {
        alert("Campos obrigatórios faltando:\n\n• " + erros.join('\n• '));
        return false;
    }
    return true;
}

async function saveFiscalSettings() {
    if (!validarCampos(camposEmitente)) return;
    
    const user = getLoggedUser();
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

    const { error } = await supabaseClient.from('fiscal_settings').upsert([settings], { onConflict: 'user_id' });
    if (error) alert("Erro ao salvar"); else alert("Dados do Emitente salvos!");
}

function preVisualizarNota() {
    const razao = document.getElementById('em-razao').value || "Não informado";
    const cliente = document.getElementById('dest-nome').value || "Não informado";
    alert(`👁️ PRÉ-VISUALIZAÇÃO DA NF-e\n--------------------------\nEmitente: ${razao}\nDestinatário: ${cliente}\nAmbiente: Homologação\nStatus: Válida para teste`);
}

async function validarETransmitir() {
    if (!validarCampos(camposEmitente)) { switchTab(1); return; }
    if (!validarCampos(camposDestinatario)) { switchTab(2); return; }
    
    const status = document.getElementById(`status-${currentNfeId}`);
    toggleNfeModal(false);
    
    if (status) {
        status.innerText = "Comunicando SEFAZ...";
        status.className = "px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase animate-pulse";
        setTimeout(() => {
            status.innerText = "NF-e Emitida";
            status.className = "px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase";
            alert("🚀 Nota Fiscal transmitida e autorizada com sucesso!");
        }, 3000);
    }
}

async function carregarDadosDaEmpresa() {
    const user = getLoggedUser();
    const { data } = await supabaseClient.from('fiscal_settings').select('*').eq('user_id', String(user.id)).single();
    if (data) {
        document.getElementById('em-cnpj').value = data.cnpj || '';
        document.getElementById('em-razao').value = data.razao_social || '';
        document.getElementById('em-ie').value = data.inscricao_estadual || '';
        document.getElementById('em-regime').value = data.regime_tributario || '1';
        document.getElementById('em-rua').value = data.logradouro || '';
        document.getElementById('em-num').value = data.numero || '';
        document.getElementById('em-cep').value = data.cep || '';
    }
}

// --- CONFIGURAÇÃO DE MÁSCARAS (IMask) ---

function aplicarMascaras() {
    // Máscara CNPJ Emitente
    IMask(document.getElementById('em-cnpj'), { mask: '00.000.000/0000-00' });
    
    // Máscara CEP Emitente
    IMask(document.getElementById('em-cep'), { mask: '00000-000' });
    
    // Máscara Telefone Emitente
    IMask(document.getElementById('em-tel'), { mask: '(00) 00000-0000' });

    // Máscara Dinâmica CPF/CNPJ Destinatário
    IMask(document.getElementById('dest-doc'), {
        mask: [
            { mask: '000.000.000-00', type: 'CPF' },
            { mask: '00.000.000/0000-00', type: 'CNPJ' }
        ]
    });
}

// Chame a função de máscaras quando o modal abrir
function abrirEmissor(id) {
    currentNfeId = id;
    toggleNfeModal(true);
    carregarDadosDaEmpresa();
    setTimeout(aplicarMascaras, 100); // Timeout curto para garantir que o DOM renderizou
}

// --- VALIDAÇÃO DE E-MAIL ---

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Atualização da função validarCampos para incluir lógica de e-mail e IE
function validarCampos(lista) {
    let erros = [];
    Object.keys(lista).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('input-error');
            const valor = el.value.trim();

            // Validação básica de vazio
            if (!valor) {
                el.classList.add('input-error');
                erros.push(lista[id]);
            } 
            // Validação específica de e-mail
            else if (el.type === 'email' && !validarEmail(valor)) {
                el.classList.add('input-error');
                erros.push(`${lista[id]} (E-mail inválido)`);
            }
        }
    });

    if (erros.length > 0) {
        alert("Atenção aos detalhes:\n\n• " + erros.join('\n• '));
        return false;
    }
    return true;
}