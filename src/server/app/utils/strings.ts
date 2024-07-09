import { nanoid } from 'nanoid';
import { createHash } from 'node:crypto';

export function generateNanoId(): string {
  return nanoid(18);
}

export function hashData(text: string): string {
  return createHash('sha256')
    .update(text)
    .digest('hex');
}
