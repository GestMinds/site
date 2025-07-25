window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  if (!email) {
    alert("Cliente não especificado.");
    return;
  }

  document.title = "Cliente - " + email;

  try {
    const res = await fetch(`/api/admin/cliente?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.erro || "Erro ao buscar cliente");

    const info = document.getElementById("info-cliente");
    info.innerHTML = `
      <h2>${data.nome}</h2>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefone:</strong> ${data.telefone || "N/A"}</p>
      <p><strong>Empresa:</strong> ${data.empresa || "N/A"}</p>
      <p><strong>Status do Projeto:</strong> ${data.status_projeto || "N/A"}</p>
      <p><strong>Progresso:</strong> ${data.progresso || 0}%</p>
      <p><strong>Total em Compras:</strong> R$ ${data.total_gasto?.toFixed(2) || "0.00"}</p>
    `;

    const historico = document.getElementById("historico-cliente");
    historico.innerHTML = "<h2>Histórico</h2>";

    if (data.pedidos && data.pedidos.length > 0) {
      data.pedidos.forEach(pedido => {
        const li = document.createElement("li");

        li.innerHTML = `
          ${new Date(pedido.created_at).toLocaleString()} - 
          <strong>${pedido.titulo}</strong> - 
          R$${pedido.valor.toFixed(2)}<br>

          <label>Status:</label>
          <select id="status-${pedido.id}">
            <option value="aberto" ${pedido.status === "aberto" ? "selected" : ""}>Aberto</option>
            <option value="em andamento" ${pedido.status === "em andamento" ? "selected" : ""}>Em andamento</option>
            <option value="concluído" ${pedido.status === "concluído" ? "selected" : ""}>Concluído</option>
          </select><br>

          <label for="progresso-${pedido.id}">Progresso (%):</label>
          <input type="number" id="progresso-${pedido.id}" value="${pedido.progresso || 0}" min="0" max="100" style="width: 60px;"><br>

          <label for="detalhes-${pedido.id}">Detalhes:</label><br>
          <textarea id="detalhes-${pedido.id}" rows="3" style="width: 100%;">${pedido.detalhes || ""}</textarea><br>

          <button onclick="atualizarStatusPedido('${pedido.id}')">Salvar</button>
          <hr>
        `;

        historico.appendChild(li);
      });
    } else {
      historico.innerHTML += "<p>Sem pedidos registrados.</p>";
    }

  } catch (err) {
    alert("Erro ao carregar dados: " + err.message);
  }
};

async function adicionarPedido() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  const titulo = document.getElementById("pedido-titulo").value.trim();
  const valor = parseFloat(document.getElementById("pedido-valor").value);
  const status = document.getElementById("pedido-status").value;

  if (!titulo || isNaN(valor)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  try {
    const res = await fetch("/api/admin/novo-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, titulo, valor, status })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.erro || "Erro ao adicionar pedido");

    alert("Pedido adicionado com sucesso!");
    location.reload();

  } catch (err) {
    alert("Erro: " + err.message);
  }
}

async function atualizarStatusPedido(id) {
  const novoStatus = document.getElementById(`status-${id}`).value;
  const novoProgresso = parseInt(document.getElementById(`progresso-${id}`).value, 10);
  const novosDetalhes = document.getElementById(`detalhes-${id}`).value;

  try {
    const res = await fetch("/api/admin/atualizar-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: novoStatus,
        progresso: novoProgresso,
        detalhes: novosDetalhes
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Atualização salva com sucesso!");
      location.reload();
    } else {
      alert("Erro: " + data.message);
    }

  } catch (err) {
    alert("Erro ao atualizar: " + err.message);
  }
}
