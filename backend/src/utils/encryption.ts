import * as crypto from 'crypto';

const ENCRYPTION_KEY: string = (
  process.env.EVAL_ENCRYPT_KEY || '12345678901234567890123456789012'
)
  .padEnd(32, '0')
  .slice(0, 32);
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

export function decrypt(text: string): string {
  if (!text) return text;
  const [ivBase64, encrypted] = text.split(':');
  if (!ivBase64 || !encrypted) return text;
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
