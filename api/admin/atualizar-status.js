import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { pedido_id, novo_status } = req.body;

  if (!pedido_id || !novo_status) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  const { error } = await supabase
    .from("pedidos")
    .update({ status: novo_status })
    .eq("id", pedido_id);

  if (error) {
    return res.status(500).json({ erro: "Erro ao atualizar o pedido" });
  }

  return res.status(200).json({ mensagem: "Status atualizado" });
}
