import crypto from 'crypto';

export function gerarAssinatura(payload: string, secretKey: string) {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

export function gerarNonce() {
  return Math.random().toString(36).substring(2);
}

export function gerarTimestamp() {
  return Date.now().toString();
}
