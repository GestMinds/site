import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  // Remove espaços e converte para minúsculo (boa prática)
  const emailLimpo = email.trim().toLowerCase();

  // Busca o usuário ignorando diferenças de letras maiúsculas/minúsculas
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .ilike("email", emailLimpo) // <-- ignora o case
    .limit(1);

  const usuario = data && data.length > 0 ? data[0] : null;

  // Logs úteis pra debug
  console.log("🔍 Buscando usuário com email:", emailLimpo);
  console.log("📦 Resultado da consulta:", usuario);

  if (error) {
    return res.status(500).json({ erro: "Erro ao buscar usuário: " + error.message });
  }

  if (!usuario) {
    return res.status(401).json({ erro: "Email não encontrado" });
  }

  if (usuario.senha !== senha) {
    return res.status(401).json({ erro: "Senha incorreta" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
}
