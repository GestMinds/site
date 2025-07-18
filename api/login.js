import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  console.log("Recebido no login:", req.body);

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("senha", senha); // lembre-se que idealmente deve ter hash na senha

  if (error) {
    return res.status(500).json({ erro: "Erro no servidor: " + error.message });
  }

  if (!usuarios || usuarios.length === 0) {
    return res.status(401).json({ erro: "Email ou senha inválidos" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
