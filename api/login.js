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

  console.log("🛠️ Dados recebidos:", { email, senha });

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("senha", senha);

  if (error) {
    console.error("❌ Erro Supabase:", error.message);
    return res.status(500).json({ erro: "Erro no servidor: " + error.message });
  }

  console.log("📦 Resultado da consulta:", data);

  if (!data || data.length === 0) {
    return res.status(401).json({ erro: "Email ou senha inválidos" });
  }

  return res.status(200).json({ mensagem: "Login realizado com sucesso!", usuario: data[0] });
}
