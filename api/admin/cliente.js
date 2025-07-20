const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ erro: "Email é obrigatório" });
    }

    // Log para verificar o email recebido
    console.log("📨 E-mail recebido:", email);

    // Busca o usuário
    const { data: usuario, error: erroUsuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (erroUsuario || !usuario) {
      console.error("❌ Erro ao buscar usuário:", erroUsuario);
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    // Busca os pedidos relacionados
    const { data: pedidos, error: erroPedidos } = await supabase
      .from("pedidos")
      .select("*")
      .eq("email", email);

    if (erroPedidos) {
      console.error("❌ Erro ao buscar pedidos:", erroPedidos);
      return res.status(500).json({ erro: "Erro ao buscar pedidos" });
    }

    console.log("📦 Pedidos encontrados:", pedidos);

    const total_gasto = pedidos?.reduce((acc, p) => acc + (p.valor || 0), 0);

    res.status(200).json({
      ...usuario,
      pedidos,
      total_gasto
    });

  } catch (err) {
    console.error("🔥 Erro inesperado:", err);
    res.status(500).json({ erro: "Erro inesperado no servidor" });
  }
};
