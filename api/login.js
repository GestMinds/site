import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const email = req.body.email?.trim();
  const senha = req.body.senha?.trim();

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  console.log("🔍 Verificando login:", { email, senha });

  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .ilike("email", email) // ignora maiúsculas/minúsculas
    .eq("senha", senha);   // senha ainda exata (sem hash por enquanto)

  if (error) {
    console.error("Erro Supabase:", error);
    return res.status(500).json({ erro: "Erro no servidor: " + error.message });
  }

  if (!usuarios || usuarios.length === 0) {
    return res.status(401).json({ erro: "Email ou senha inválidos" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
