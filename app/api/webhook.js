import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Configurações externas (fora do handler para performance)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'noreply@gestminds.com.br',
    pass: process.env.ZOHO_PASSWORD // Use variáveis de ambiente para a senha!
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const data = req.body;

  try {
    if (!data || !data.Customer) {
      return res.status(400).json({ error: 'Dados ausentes' });
    }

    const email = data.Customer.email;
    const name = data.Customer.full_name;
    const orderStatus = data.order_status;
    const productName = data.Product ? data.Product.product_name : 'Plano GestMinds';

    if (orderStatus === 'paid' || orderStatus === 'approved') {
      const temporaryPassword = Math.random().toString(36).slice(-8);

      // 1. Salva no Banco de Dados
      const { error: dbError } = await supabase
        .from('profiles')
        .insert([{ 
            email: email, 
            password: temporaryPassword, 
            full_name: name,
            plan_type: productName,
            status: 'active' 
        }]);

      if (dbError) {
        if (dbError.code === '23505') return res.status(200).json({ message: 'Já cadastrado' });
        throw dbError;
      }

      // 2. Envia o E-mail (Somente se o banco salvou com sucesso)
      await transporter.sendMail({
        from: '"GestMinds" <noreply@gestminds.com.br>',
        to: email,
        subject: '🚀 Seu acesso ao GestMinds chegou!',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Olá, ${name}!</h2>
            <p>Sua assinatura do <strong>${productName}</strong> foi confirmada.</p>
            <p>Aqui estão suas credenciais de acesso:</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
              <p style="margin: 0;"><strong>E-mail:</strong> ${email}</p>
              <p style="margin: 0;"><strong>Senha:</strong> ${temporaryPassword}</p>
            </div>
            <br>
            <a href="https://app.gestminds.com.br/login.html" 
               style="background: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
               Acessar meu Painel
            </a>
            <p style="font-size: 12px; color: #777; margin-top: 25px;">
              Recomendamos alterar sua senha após o primeiro acesso.
            </p>
          </div>`
      });

      console.log(`✅ Sucesso: ${email} cadastrado e notificado.`);
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ message: 'Aguardando pagamento' });

  } catch (err) {
    console.error("Erro no Webhook:", err.message);
    return res.status(500).json({ error: err.message });
  }
}