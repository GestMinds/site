window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  if (!email) {
    alert("Cliente não especificado.");
    return;
  }

  document.title = "Cliente - " + email;

  try {
    // Buscar dados do cliente
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
        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>${pedido.titulo}</strong> - ${pedido.status} - R$${pedido.valor.toFixed(2)}</p>
        `;
        historico.appendChild(div);
      });
    } else {
      historico.innerHTML += "<p>Sem pedidos registrados.</p>";
    }

  } catch (err) {
    alert("Erro ao carregar dados: " + err.message);
  }
};
