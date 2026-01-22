// assets/js/inventory.js

async function toggleModal(tipo, show) {
    let modalId = `modal-${tipo}`;

    // Lógica especial para Entrada e Saída
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
        modalId = 'modal-movimentacao'; // Redireciona para o ID correto do modal único
    }

    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden', !show);
    } else {
        console.error("Modal não encontrado:", modalId);
    }
}