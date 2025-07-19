window.onload = async () => {
  const email = localStorage.getItem("usuarioEmail");
  if (!email) {
    alert("Usuário não logado");
    window.location.href = "../Sistema-Cadastro-Login/login-cadastro.html";
    return;
  }

  const res = await fetch("/api/dados-cliente?email=" + encodeURIComponent(email));
  const data = await res.json();

  if (!res.ok) {
    alert("Erro ao carregar dados do cliente.");
    return;
  }

  // Nome e status
    document.getElementById("boas-vindas").innerText = `Bem-vindo, ${data.nome}`;
    document.getElementById("status-projeto").innerText = data.status_projeto || "Em análise";

  // Progresso
  const progresso = data.progresso || 0;
  const barra = document.getElementById("progresso");
  barra.style.width = `${progresso}%`;
  barra.innerText = `${progresso}%`;

  // Gráfico com Chart.js
  const grafico = new Chart(document.getElementById("graficoProgresso"), {
    type: 'doughnut',
    data: {
      labels: ['Concluído', 'Restante'],
      datasets: [{
        data: [progresso, 100 - progresso],
        backgroundColor: ['#dd2476', '#e0e0e0'],
        borderWidth: 1
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });

  // Histórico
  const historico = document.getElementById("historico-pedidos");
  data.historico.forEach(pedido => {
    const li = document.createElement("li");
    li.innerHTML = `${pedido.data} - <strong>${pedido.titulo}</strong> - R$${pedido.valor.toFixed(2)} <button class="ver-btn" data-detalhes="${pedido.detalhes}">Ver</button>`;
    historico.appendChild(li);
  });

  // Modal de detalhes
  document.querySelectorAll(".ver-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("pedido-detalhes").innerText = btn.dataset.detalhes;
      document.getElementById("pedido-modal").classList.remove("hidden");
    });
  });

  document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("pedido-modal").classList.add("hidden");
  });

  // Arquivos
  const arquivos = document.getElementById("lista-arquivos");
  arquivos.innerHTML = "";
  (data.arquivos || []).forEach((file, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${file.url}" target="_blank">📎 Arquivo ${i + 1}</a>`;
    arquivos.appendChild(li);
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuarioEmail");
    window.location.href = "../Sistema-Cadastro-Login/login-cadastro.html";
  });
};

const email = localStorage.getItem("usuarioEmail");

const admins = [
  "empresarialvitorbr@outlook.com",
  "ph0984596@gmail.com"
];

if (admins.includes(email)) {
  window.location.href = "/adm/admin.html";
}
