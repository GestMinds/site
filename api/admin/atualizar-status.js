// /api/admin/pedidos-abertos.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .not("status", "eq", "concluído")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ erro: "Erro ao buscar pedidos abertos." });
  }

  res.status(200).json(data);
}
