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
      li.innerHTML = `<strong>${pedido.titulo}</strong> - ${pedido.status} - R$${pedido.valor.toFixed(2)}`;
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
        <strong>${user.nome}</strong> (${user.email})<br>
        Status: ${user.status_projeto || "N/A"}<br>
        Progresso: ${user.progresso || 0}%
      `;
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
