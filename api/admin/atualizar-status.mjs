import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, status, progresso, detalhes } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ message: "ID e status são obrigatórios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updateData = {
      status,
      ...(typeof progresso === "number" ? { progresso } : {}),
      ...(typeof detalhes === "string" ? { detalhes } : {})
    };

    const { error } = await supabase
      .from("pedidos")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Erro Supabase:", error);
      return new Response(JSON.stringify({ message: "Erro ao atualizar", error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Pedido atualizado com sucesso" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Erro inesperado:", err);
    return new Response(JSON.stringify({ message: "Erro interno", error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
