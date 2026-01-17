import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log("Método:", req.method);
  // O log confirmou que os dados chegam com iniciais maiúsculas
  const data = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // AJUSTE AQUI: A Kiwify usa 'Customer' e 'Product' com iniciais maiúsculas
    if (!data || !data.Customer) {
      console.error("Estrutura inválida. Recebido:", JSON.stringify(data));
      return res.status(400).json({ error: 'Dados do Customer ausentes' });
    }

    const email = data.Customer.email;
    const name = data.Customer.full_name;
    const orderStatus = data.order_status;
    const productName = data.Product ? data.Product.product_name : 'Plano GestMinds';

    // Se for aprovado ou pago
    if (orderStatus === 'paid' || orderStatus === 'approved') {
      
      const temporaryPassword = Math.random().toString(36).slice(-8);

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
        if (dbError.code === '23505') {
            return res.status(200).json({ message: 'Usuário já existe' });
        }
        throw dbError;
      }

      console.log(`✅ SUCESSO: Usuário ${email} criado no Supabase!`);
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ message: 'Status ignorado: ' + orderStatus });

  } catch (err) {
    console.error("Erro fatal:", err.message);
    return res.status(500).json({ error: err.message });
  }
}