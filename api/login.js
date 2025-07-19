const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { email, senha } = req.body;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('senha', senha)
    .single();

  if (error || !usuario) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  // ✅ Registrar acesso
  await supabase.from('acessos').insert([{ usuario: email }]);

  res.status(200).json({ email: usuario.email });
};
