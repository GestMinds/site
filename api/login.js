import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios." });
    }

    // ✅ Limpa espaços em branco
    const emailLimpo = email.trim();

    // 🔍 Busca o usuário pelo e-mail
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

    // ✅ Verifica a senha
    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    return res.status(200).json({ mensagem: "Login realizado com sucesso!" });

  } catch (err) {
    console.error("Erro no login:", err.message);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
