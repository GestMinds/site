// Exemplo de lógica para processar o pagamento da Kiwify
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const body = req.body;

    // 1. Verificar se o status é "paid" (pago)
    if (body.order_status === 'paid' || body.order_status === 'approved') {
        const email = body.customer.email;
        const nome = body.customer.name;
        const plano = body.product_name; // Kiwify envia o nome do produto
        
        // 2. Gerar senha aleatória
        const temporaryPassword = Math.random().toString(36).slice(-8);

        // --- PRÓXIMO PASSO CRÍTICO ---
        // Aqui precisamos salvar no Banco de Dados. 
        // Como ainda não configuramos, vou deixar o log para você ver no painel da Vercel
        console.log(`Usuário Criado: ${email} | Senha: ${temporaryPassword} | Plano: ${plano}`);

        // 3. TODO: Integrar com serviço de e-mail (Resend/SendGrid)
        // enviarEmail(email, temporaryPassword);

        return res.status(200).json({ received: true });
    }

    return res.status(200).json({ message: 'Aguardando aprovação' });
}