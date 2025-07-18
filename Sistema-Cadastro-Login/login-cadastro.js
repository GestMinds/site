function mostrarCadastro() {
  document.title = "Cadastro - GestMinds"
  document.getElementById("form-login").classList.add("hidden")
  document.getElementById("form-cadastro").classList.remove("hidden")
}

function mostrarLogin() {
  document.title = "Login - GestMinds"
  document.getElementById("form-cadastro").classList.add("hidden")
  document.getElementById("form-login").classList.remove("hidden")
}

async function fazerLogin() {
  const email = document.getElementById("login-email").value.trim()
  const senha = document.getElementById("login-senha").value.trim()

  if (!email || !senha) {
    alert("Preencha todos os campos para fazer login.")
    return
  }

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  })

  const data = await res.json()

  if (res.ok) {
    alert("Login realizado com sucesso!")
  } else {
    alert("Erro: " + data.erro)
  }
}

async function fazerCadastro() {
  const nome = document.getElementById("cadastro-nome").value.trim()
  const email = document.getElementById("cadastro-email").value.trim()
  const senha = document.getElementById("cadastro-senha").value.trim()
  const telefone = document.getElementById("cadastro-telefone").value.trim()
  const empresa = document.getElementById("cadastro-empresa").value.trim()
  const instagram = document.getElementById("cadastro-instagram").value.trim()
  const site = document.getElementById("cadastro-site").value.trim()
  const origem = document.getElementById("cadastro-origem").value

  if (!nome || !email || !senha || !telefone || !origem) {
    alert("Preencha todos os campos obrigatórios.")
    return
  }

  const res = await fetch("/api/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      senha,
      telefone,
      empresa,
      instagram,
      site,
      origem
    }),
  })

  const data = await res.json()

  if (res.ok) {
    alert("Cadastro realizado! Agora faça login.")
    mostrarLogin()
  } else {
    alert("Erro: " + data.erro)
  }
}

