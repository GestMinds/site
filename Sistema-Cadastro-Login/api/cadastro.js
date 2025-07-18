import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { nome, email, senha, telefone, empresa, instagram, site, origem } = req.body

  if (!nome || !email || !senha || !telefone || !origem) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." })
  }

  const { data: existente } = await supabase
    .from("usuarios")
    .select("email")
    .eq("email", email)

  if (existente && existente.length > 0) {
    return res.status(400).json({ erro: "Email já cadastrado." })
  }

  const { error } = await supabase
    .from("usuarios")
    .insert([{ nome, email, senha, telefone, empresa, instagram, site, origem }])

  if (error) {
    return res.status(500).json({ erro: "Erro ao cadastrar usuário." })
  }

  return res.status(200).json({ mensagem: "Usuário cadastrado com sucesso." })
}

