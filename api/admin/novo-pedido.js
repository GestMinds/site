const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { email, titulo, valor, status } = req.body;

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
    return res.status(500).json({ erro: "Erro ao inserir pedido" });
  }

  res.status(200).json({ ok: true });
};
