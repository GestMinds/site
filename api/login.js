import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  // Retira espaços acidentais
  const emailLimpo = email.trim();

  // Busca o usuário pelo email
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", emailLimpo)
    .limit(1)
    .single(); // pega só 1

  // 👇 Coloca o log aqui, depois da resposta
  console.log("🔍 Buscando usuário com email:", emailLimpo);
  console.log("📦 Resultado:", usuarios, error);

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(401).json({ erro: "Email não encontrado" });
    }
    return res.status(500).json({ erro: "Erro ao buscar usuário: " + error.message });
  }

  // Verifica a senha
  if (usuarios.senha !== senha) {
    return res.status(401).json({ erro: "Senha incorreta" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
