import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Extrai e remove espaços em branco
  const email = req.body.email?.trim();
  const senha = req.body.senha?.trim();

  console.log("Tentativa de login com:", { email, senha });

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  // Busca o usuário no Supabase
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("senha", senha); // OBS: no futuro troque para hash!

  if (error) {
    console.error("Erro do Supabase:", error.message);
    return res.status(500).json({ erro: "Erro no servidor: " + error.message });
  }

  if (!usuarios || usuarios.length === 0) {
    console.log("Login falhou para:", email);
    return res.status(401).json({ erro: "Email ou senha inválidos" });
  }

  // Login bem-sucedido
  console.log("Login OK:", usuarios[0]);
  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
