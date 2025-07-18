let users = []

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { email, senha } = req.body

  const user = users.find((u) => u.email === email && u.senha === senha)

  if (user) {
    res.status(200).json({ mensagem: "Login OK" })
  } else {
    res.status(401).json({ erro: "Email ou senha inválidos" })
  }
}
