import bcrypt from 'bcrypt';

// senha digitada pelo usuário
const senhaDigitada = 'Dubran10@@'; // agora corresponde à hash salva no banco

// hash que está no banco
const hashDoBanco = '$2b$10$To.c86ZQn0NvMviTidM0OE0o.r390AdOzGAq074kt8DVmKm9Dm5rK';

async function testarSenha() {
  try {
    const resultado = await bcrypt.compare(senhaDigitada, hashDoBanco);

    if (resultado) {
      console.log('✅ Senha correta! Login funcionaria.');
    } else {
      console.log('❌ Senha incorreta. Algo está errado.');
    }
  } catch (erro) {
    console.error('⚠️ Erro ao verificar a senha:', erro);
  }
}

testarSenha();
