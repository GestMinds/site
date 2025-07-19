import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email, titulo, valor, status } = req.body;

  if (!email || !titulo || !valor) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  const { error } = await supabase.from('pedidos').insert([
    { email, titulo, valor, status: status || 'pendente' }
  ]);

  if (error) {
    console.error('Erro Supabase:', error);
    return res.status(500).json({ message: 'Erro ao salvar no banco' });
  }

  res.status(200).json({ message: 'Pedido salvo com sucesso' });
}
