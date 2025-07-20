window.onload = async () => {
  const email = localStorage.getItem("usuarioEmail");
  if (!email) {
    alert("Usuário não logado");
    window.location.href = "../Sistema-Cadastro-Login/login-cadastro.html";
    return;
  }

  const res = await fetch("/api/admin/cliente?email=" + encodeURIComponent(email));

  const data = await res.json();

  console.log("👉 PEDIDOS BRUTOS:", data.pedidos); // << ADICIONE ISSO

  if (!res.ok) {
    alert("Erro ao carregar dados do cliente.");
    return;
  }

  console.log("Dados recebidos:", data); // Debug

  // Nome e status
  document.getElementById("boas-vindas").innerText = `Bem-vindo, ${data.nome}`;
  document.getElementById("status-projeto").innerText = data.status_projeto || "Em análise";

  // Progresso
  const progresso = data.progresso || 0;
  const barra = document.getElementById("progresso");
  barra.style.width = `${progresso}%`;
  barra.innerText = `${progresso}%`;

  // Gráfico com Chart.js
  new Chart(document.getElementById("graficoProgresso"), {
    type: "doughnut",
    data: {
      labels: ["Concluído", "Restante"],
      datasets: [
        {
          data: [progresso, 100 - progresso],
          backgroundColor: ["#dd2476", "#e0e0e0"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    },
  });

  // Andamento
  const andamentoContainer = document.getElementById("andamento-pedidos");
  andamentoContainer.innerHTML = "";

  const emAndamento = data.pedidos.filter(
    (p) => p.status?.toLowerCase() !== "concluído"
  );

  if (emAndamento.length === 0) {
    andamentoContainer.innerHTML = "<li>Nenhum projeto em andamento no momento.</li>";
  } else {
    emAndamento.forEach((pedido) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${pedido.titulo}</strong> - R$${pedido.valor.toFixed(2)}<br>
        <small>${new Date(pedido.created_at).toLocaleDateString("pt-BR")}</small><br>
        Status: <em>${pedido.status}</em><br>
        <button class="ver-btn" data-detalhes="${pedido.detalhes || 'Sem detalhes'}">Ver Detalhes</button>
      `;
      andamentoContainer.appendChild(li);
    });
  }

  // Histórico
  const historico = document.getElementById("historico-pedidos");
  historico.innerHTML = "";

  let totalCompras = 0;

  data.pedidos.forEach((pedido) => {
    const li = document.createElement("li");
    const dataFormatada = new Date(pedido.created_at).toLocaleDateString("pt-BR");

    li.innerHTML = `${dataFormatada} - <strong>${pedido.titulo}</strong> - R$${pedido.valor.toFixed(2)} <button class="ver-btn" data-detalhes="${pedido.detalhes || 'Sem detalhes'}">Ver</button>`;
    historico.appendChild(li);

    totalCompras += pedido.valor;
  });

  const totalDiv = document.createElement("p");
  totalDiv.innerText = `💰 Total gasto: R$${totalCompras.toFixed(2)}`;
  historico.parentElement.insertBefore(totalDiv, historico);

  // Modal de detalhes
  document.querySelectorAll(".ver-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("pedido-detalhes").innerText = btn.dataset.detalhes;
      document.getElementById("pedido-modal").classList.remove("hidden");
    });
  });

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("pedido-modal").classList.add("hidden");
    });
  });

  // Arquivos recebidos
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

// Redirecionamento admin
const email = localStorage.getItem("usuarioEmail");
const admins = ["empresarialvitorbr@outlook.com", "ph0984596@gmail.com"];
if (admins.includes(email)) {
  window.location.href = "/adm/admin.html";
}
