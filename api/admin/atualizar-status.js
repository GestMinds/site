import { supabase } from "../../utils/supabaseClient"; // ajuste o path conforme seu projeto

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "Dados incompletos" });
  }

  const { error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ message: "Erro ao atualizar", error });
  }

  return res.status(200).json({ message: "Status atualizado com sucesso" });
}
