// dashboard.js
window.onload = async () => {
  const email = localStorage.getItem("usuarioEmail");
  if (!email) {
    alert("Usuário não logado");
    window.location.href = "login-cadastro.html";
    return;
 }

  const res = await fetch("/api/dados-cliente?email=" + encodeURIComponent(email));
  const data = await res.json();

  if (!res.ok) {
    alert("Erro ao carregar dados do cliente.");
    return;
  }

  document.getElementById("cliente-nome").innerText = data.nome;
  document.getElementById("status-projeto").innerText = data.status_projeto || "Não informado";

  const progresso = data.progresso || 0;
  const barra = document.getElementById("progresso");
  barra.style.width = `${progresso}%`;
  barra.innerText = `${progresso}%`;

  const historico = document.getElementById("historico-pedidos");
  data.historico.forEach(pedido => {
    const li = document.createElement("li");
    li.innerText = `${pedido.data} - ${pedido.titulo} - R$${pedido.valor}`;
    historico.appendChild(li);
  });
};

<button onclick="logout()">Sair</button>
function logout() {
  localStorage.removeItem("usuarioEmail");
  window.location.href = "/Sistema-Cadastro-Login/login-cadastro.html";
}

