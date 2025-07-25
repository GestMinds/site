
console.log("🚀 dashboard.js carregado");

window.onload = async () => {
  try {
    const res = await fetch('/api/admin/pedidos-todos');
    const pedidos = await res.json();

    if (!res.ok) throw new Error(pedidos.erro || "Erro ao buscar pedidos");

    const total = pedidos.length;
    const concluido = pedidos.filter(p => p.status === 'concluído').length;
    const emAndamento = pedidos.filter(p => p.status === 'em andamento').length;
    const pendente = pedidos.filter(p => p.status === 'pendente' || p.status === 'aberto').length;

    const porcentagemConcluido = total > 0 ? Math.round((concluido / total) * 100) : 0;

    // Atualiza a barra
    const barra = document.getElementById("progresso");
    if (barra) {
      barra.style.width = `${porcentagemConcluido}%`;
      barra.textContent = `${porcentagemConcluido}%`;
    }

    // Gráfico
    const ctx = document.getElementById("graficoProgresso")?.getContext("2d");
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Concluído', 'Em Andamento', 'Pendente'],
          datasets: [{
            data: [concluido, emAndamento, pendente],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

  } catch (err) {
    console.error("Erro ao carregar progresso:", err);
  }
};

console.log("📦 Dados recebidos:", pedidos);
