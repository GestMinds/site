import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Método não permitido' }));
    return;
  }

  // Vercel Serverless não suporta req.json(), usamos chunks
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (err) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'JSON inválido' }));
    return;
  }

  const { email, titulo, valor, status } = parsed;

  if (!email || !titulo || !valor) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'Dados incompletos' }));
    return;
  }

  const { error } = await supabase.from('pedidos').insert([
    { email, titulo, valor, status: status || 'pendente' }
  ]);

  if (error) {
    console.error('Erro Supabase:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Erro ao salvar no banco' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Pedido salvo com sucesso' }));
}
