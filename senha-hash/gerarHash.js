import bcrypt from 'bcrypt';

async function gerarHash() {
  const senhaNova = ''; // <- coloque a senha que você quer que ele use
  const hash = await bcrypt.hash(senhaNova, 10);
  console.log('Hash gerado:', hash);
}

gerarHash();
