import crypto from 'crypto';

export function hash(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(input, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function validateHash(password: string, hash: string): boolean {
  if (!hash || !hash.includes(':')) {
    throw new Error('Invalid hash');
  }
  const [salt, key] = hash.split(':');
  const hashToCheck = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hashToCheck === key;
}
