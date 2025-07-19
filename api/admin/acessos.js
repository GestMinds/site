export default function handler(req, res) {
  const acessosFalsos = [
    { usuario: "empresarialvitorbr@outlook.com", data: new Date() },
    { usuario: "ph0984596@gmail.com", data: new Date(Date.now() - 3600000) },
  ];

  res.status(200).json(acessosFalsos);
}
