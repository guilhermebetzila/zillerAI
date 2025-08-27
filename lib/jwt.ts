import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || 'sua-chave-super-secreta'; // 👈 alterado aqui

export function signToken(payload: { id: number }) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: number } | null {
  try {
    return jwt.verify(token, SECRET) as { id: number };
  } catch {
    return null;
  }
}
