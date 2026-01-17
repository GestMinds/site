import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase (as chaves você pega no painel do Supabase)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use a Service Role para ter permissão de escrita
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = req.body;

  // Verifica se o pagamento foi aprovado
  if (body.order_status === 'paid' || body.order_status === 'approved') {
    const { email, name } = body.customer;
    const plano = body.product_name;
    const temporaryPassword = Math.random().toString(36).slice(-8); // Gera senha de 8 caracteres

    // Inserindo no Banco de Dados
    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          email: email, 
          password: temporaryPassword, 
          full_name: name,
          plan_type: plano,
          status: 'active' 
        }
      ]);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      return res.status(500).json({ error: 'Erro ao criar conta' });
    }

    // TODO: Aqui dispararemos o e-mail via Resend futuramente
    console.log(`Sucesso! Cliente ${email} criado com a senha ${temporaryPassword}`);
    
    return res.status(200).json({ message: 'Usuário criado com sucesso' });
  }

  return res.status(200).json({ message: 'Evento ignorado' });
}