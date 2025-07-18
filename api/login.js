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

  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .limit(1)
    .single();

  console.log("🔍 Buscando usuário com email:", email);
  console.log("📦 Resultado:", usuarios, error);

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(401).json({ erro: "Email não encontrado" });
    }
    return res.status(500).json({ erro: "Erro ao buscar usuário: " + error.message });
  }

  if (usuarios.senha !== senha) {
    return res.status(401).json({ erro: "Senha incorreta" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
