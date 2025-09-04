import bcrypt from 'bcrypt';

async function gerarHash() {
  const senhaNova = 'Dubran10@@'; // senha em texto que o usuário vai usar
  const hash = await bcrypt.hash(senhaNova, 10);
  console.log('Hash gerado:', hash);
}

gerarHash();
