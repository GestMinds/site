import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { nome, email, senha, telefone, empresa, instagram, site, origem } = req.body;

    if (!nome || !email || !senha || !telefone || !origem) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    const { data: existente, error: erroConsulta } = await supabase
      .from("usuarios")
      .select("email")
      .eq("email", email);

    if (erroConsulta) {
      throw new Error("Erro ao verificar e-mails existentes: " + erroConsulta.message);
    }

    if (existente && existente.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado." });
    }

    const { error: erroInsercao } = await supabase
      .from("usuarios")
      .insert([{ nome, email, senha, telefone, empresa, instagram, site, origem }]);

    if (erroInsercao) {
      throw new Error("Erro ao inserir usuário: " + erroInsercao.message);
    }

    return res.status(200).json({ mensagem: "Usuário cadastrado com sucesso." });

  } catch (err) {
    console.error("Erro no cadastro:", err.message);
    return res.status(500).json({ erro: "Erro no servidor: " + err.message });
  }
}
