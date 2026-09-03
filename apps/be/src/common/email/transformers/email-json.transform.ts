import type { IEmailAddressJson } from '../models/email.types';

export function stringToEmailJson(string: string): IEmailAddressJson {
  const match = string.match(/^(.+) <(.+)>$/);
  if (match) {
    const [, name, email] = match;
    return { name, email };
  }
  throw new Error(`Invalid email string: ${string}`);
}
