import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, senha } = req.body;

  if (!email || !senha) {
    console.log("Faltando email ou senha");
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  console.log("Tentando login para email:", email);

  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .ilike("email", email)  // ignora case no email
    .eq("senha", senha); // senha precisa bater exatamente

  if (error) {
    console.error("Erro no banco:", error);
    return res.status(500).json({ erro: "Erro no servidor: " + error.message });
  }

  console.log("Resultado da query:", usuarios);

  if (!usuarios || usuarios.length === 0) {
    return res.status(401).json({ erro: "Email ou senha inválidos" });
  }

  // Login ok
  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
