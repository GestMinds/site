import { createClient } from '@supabase/supabase-js';

// Inicializa o Supabase fora do handler para performance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // 1. Log para debug no painel da Vercel
  console.log("Método:", req.method);
  console.log("Payload recebido:", req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // A Kiwify envia os dados no req.body
    const data = req.body;

    // 2. Proteção: Verifica se o objeto customer existe
    if (!data || !data.customer) {
      console.error("Estrutura de dados inválida da Kiwify");
      return res.status(400).json({ error: 'Dados do cliente ausentes' });
    }

    const { email, name } = data.customer;
    const orderStatus = data.order_status;
    const productName = data.product_name || 'Plano GestMinds';

    // 3. Só processa se for aprovado (ou se for o teste da Kiwify)
    if (orderStatus === 'paid' || orderStatus === 'approved' || !orderStatus) {
      
      const temporaryPassword = Math.random().toString(36).slice(-8);

      // 4. Insere no Supabase
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([
          { 
            email: email, 
            password: temporaryPassword, 
            full_name: name,
            plan_type: productName,
            status: 'active' 
          }
        ]);

      if (dbError) {
        // Se o erro for "Duplicate", significa que o cliente já existe
        if (dbError.code === '23505') {
            return res.status(200).json({ message: 'Usuário já cadastrado anteriormente' });
        }
        throw dbError;
      }

      console.log(`✅ Sucesso! Usuário ${email} criado.`);
      return res.status(200).json({ success: true, message: 'Usuário criado' });
    }

    return res.status(200).json({ message: 'Status não processável: ' + orderStatus });

  } catch (err) {
    console.error("Erro fatal no Webhook:", err.message);
    return res.status(500).json({ error: err.message });
  }
}