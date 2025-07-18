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

  console.log("🔍 Verificando login:", { email, senha });

  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email.trim())
    .eq("senha", senha.trim());

  if (error) {
    console.error("Erro no Supabase:", error);
    return res.status(500).json({ erro: "Erro no servidor: " + error.message });
  }

  if (!usuarios || usuarios.length === 0) {
    return res.status(401).json({ erro: "Email ou senha inválidos" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
