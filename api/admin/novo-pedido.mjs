import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { email, titulo, valor, status } = await req.json();

    if (!email || !titulo || !valor) {
      return res.status(400).json({ erro: "Dados incompletos" });
    }

    const { error } = await supabase.from("pedidos").insert([{
      email,
      titulo,
      valor,
      status,
      data: new Date().toISOString()
    }]);

    if (error) {
      console.error("Erro Supabase:", error);
      return res.status(500).json({ erro: "Erro ao inserir pedido" });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Erro inesperado:", err);
    return res.status(500).json({ erro: "Erro inesperado no servidor" });
  }
}
