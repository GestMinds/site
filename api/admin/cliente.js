const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log("🔍 Buscando pedidos para:", email);

  // Pega todos os pedidos desse cliente
  const { data: pedidos, error: pedidosErro } = await supabase
    .from("pedidos")
    .select("*")
    .eq("email", email);

  console.log("📦 Pedidos encontrados:", pedidos);
  if (pedidosErro) {
    console.error("❌ Erro ao buscar pedidos:", pedidosErro);
  }


module.exports = async function handler(req, res) {
  const email = req.query.email;

  if (!email) return res.status(400).json({ erro: "Email é obrigatório" });

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !usuario) {
    return res.status(404).json({ erro: "Cliente não encontrado" });
  }

  // Pega todos os pedidos desse cliente
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .eq("email", email);

  const total_gasto = pedidos?.reduce((acc, p) => acc + (p.valor || 0), 0);

  res.status(200).json({
    ...usuario,
    pedidos,
    total_gasto
  });
};
