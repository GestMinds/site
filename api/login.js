import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let { email, senha } = req.body;

  // Remove espaços
  email = email?.trim();
  senha = senha?.trim();

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  const { data, error } = await supabase
  .from("usuarios")
  .select("*")
  .eq("email", emailLimpo)
  .limit(1);

  const usuario = data && data.length > 0 ? data[0] : null;

  console.log("🔍 Buscando usuário com email:", emailLimpo);
  console.log("📦 Resultado:", usuario, error);

  if (!usuario) {
    return res.status(401).json({ erro: "Email não encontrado" });
  }

  if (usuario.senha !== senha) {
    return res.status(401).json({ erro: "Senha incorreta" });
  }


  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
