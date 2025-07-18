const form = document.getElementById("formCadastro");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      senha: document.getElementById("senha").value,
      telefone: document.getElementById("telefone").value,
      empresa: document.getElementById("empresa").value,
      instagram: document.getElementById("instagram").value,
      site: document.getElementById("site").value,
      origem: document.getElementById("origem").value || "landing-page"
    };

    const res = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await res.json();

    if (resultado.erro) {
      alert("Erro: " + resultado.erro);
    } else {
      alert("✅ Cadastro realizado com sucesso!");
      form.reset(); // Limpa o formulário
      modal.style.display = "none"; // Fecha o modal se quiser
    }
  });
}
