import { createClient } from '@supabase/supabase-js';

// Inicializa o Supabase fora do handler para economizar memória entre chamadas
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // 1. Logs Iniciais para Debug
  console.log("--- WEBHOOK RECEBIDO ---");
  console.log("Método:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = req.body;

  try {
    // 2. Validação dos dados vindos da Kiwify
    if (!data || !data.Customer) {
      console.error("Payload inválido:", JSON.stringify(data));
      return res.status(400).json({ error: 'Dados do Customer ausentes' });
    }

    const email = data.Customer.email;
    const name = data.Customer.full_name;
    const orderStatus = data.order_status;
    const productName = data.Product ? data.Product.product_name : 'Plano GestMinds';

    // 3. Processamento apenas de pagamentos aprovados
    if (orderStatus === 'paid' || orderStatus === 'approved') {
      
      // Gera uma senha aleatória curta (6 caracteres)
      const temporaryPassword = Math.random().toString(36).slice(-6);

      // 4. Inserção no Supabase
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([{ 
            email: email.toLowerCase().trim(), 
            password: temporaryPassword, 
            full_name: name,
            plan_type: productName,
            status: 'active' 
        }]);

      if (dbError) {
        // Se o usuário já existir, a Kiwify recebe um OK (200) para não ficar tentando reenviar
        if (dbError.code === '23505') {
          console.log(`Usuário ${email} já existe no banco.`);
          return res.status(200).json({ message: 'Usuário já cadastrado' });
        }
        throw dbError;
      }

      console.log(`✅ SUCESSO: ${email} criado com a senha: ${temporaryPassword}`);
      
      // Retornamos um JSON de sucesso para a Kiwify
      return res.status(200).json({ 
        success: true, 
        created: email,
        password_assigned: temporaryPassword 
      });
    }

    // Se o status for 'waiting_payment' ou outro, apenas avisamos que recebemos
    console.log(`Status ignorado: ${orderStatus} para ${email}`);
    return res.status(200).json({ message: 'Status não processável: ' + orderStatus });

  } catch (err) {
    console.error("❌ ERRO NO WEBHOOK:", err.message);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}