window.onload = async () => {
  // Checar login, redirecionar se não for admin
  const email = localStorage.getItem("usuarioEmail");
  const admins = ["empresarialvitorbr@outlook.com", "ph0984596@gmail.com"];

  

  if (!email || !admins.includes(email.toLowerCase())) {
    alert("Acesso negado! Você não é um administrador.");
    window.location.href = "/dashboard/dashboard.html";
    return;
  }

  // Buscar dados da API (exemplo, adapta as rotas do backend)
  try {
    const resUsuarios = await fetch("/api/admin/usuarios");
    const usuarios = await resUsuarios.json();

    const resAcessos = await fetch("/api/admin/acessos");
    const acessos = await resAcessos.json();

    const resPedidos = await fetch("/api/admin/pedidos-abertos");
    const pedidos = await resPedidos.json();

    const resArquivos = await fetch("/api/admin/arquivos");
    const arquivos = await resArquivos.json();

    // Mostrar total de usuários
    document.getElementById("total-usuarios").innerText = usuarios.length;

    // Mostrar últimos acessos
    const listaAcessos = document.getElementById("lista-acessos");
    listaAcessos.innerHTML = "";
    acessos.forEach(acesso => {
      const li = document.createElement("li");
      li.innerText = `${acesso.usuario} - ${new Date(acesso.data).toLocaleString()}`;
      listaAcessos.appendChild(li);
    });

    // Mostrar pedidos abertos
    const pedidosAbertos = document.getElementById("pedidos-abertos");
    pedidosAbertos.innerHTML = "";
    pedidos.forEach(pedido => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${pedido.titulo}</strong><br>
        Status atual: <strong>${pedido.status}</strong><br>
        Valor: R$${pedido.valor.toFixed(2)}<br>
        
        <label for="status-${pedido.id}">Atualizar status:</label>
        <select id="status-${pedido.id}">
          <option value="aberto" ${pedido.status === "aberto" ? "selected" : ""}>Aberto</option>
          <option value="em andamento" ${pedido.status === "em andamento" ? "selected" : ""}>Em andamento</option>
          <option value="concluído" ${pedido.status === "concluído" ? "selected" : ""}>Concluído</option>
        </select>
        <button onclick="atualizarStatusPedido('${pedido.id}')">Salvar</button>
      `;
      pedidosAbertos.appendChild(li);
    });


    // Mostrar arquivos enviados
    const listaArquivos = document.getElementById("lista-arquivos");
    listaArquivos.innerHTML = "";
    arquivos.forEach(arquivo => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${arquivo.url}" target="_blank">📎 ${arquivo.nome}</a>`;
      listaArquivos.appendChild(li);
    });

    // Gerenciar clientes (exemplo simples)
    const clientesContainer = document.getElementById("clientes-container");
    clientesContainer.innerHTML = "";
    usuarios.forEach(user => {
      const div = document.createElement("div");
      div.style.padding = "8px";
      div.style.borderBottom = "1px solid #004d40";
      div.innerHTML = `
      <button class="cliente-btn" onclick="window.location.href='/adm/cliente.html?email=${encodeURIComponent(user.email)}'">
        <strong>${user.nome}</strong> (${user.email})<br>
        Status: ${user.status_projeto || "N/A"}<br>
        Progresso: ${user.progresso || 0}%
      </button>
    `;
    div.style.padding = "0";
    div.style.borderBottom = "1px solid #004d40";

      clientesContainer.appendChild(div);
    });

  } catch (error) {
    alert("Erro ao carregar dados do painel admin: " + error.message);
  }

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuarioEmail");
    window.location.href = "/Sistema-Cadastro-Login/login-cadastro.html";
  });
};

async function atualizarStatusPedido(id) {
  const novoStatus = document.getElementById(`status-${id}`).value;

  try {
    const res = await fetch("/api/admin/atualizar-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, status: novoStatus })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Status atualizado com sucesso!");
      window.location.reload(); // Recarrega para refletir o novo status
    } else {
      alert("Erro ao atualizar: " + data.message);
    }
  } catch (error) {
    alert("Erro ao atualizar status: " + error.message);
  }
}

