import crypto from 'crypto';
import { env } from '../config/env';

export interface AdminPayload {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN';
  iat: number;
  exp: number;
}

export function createAdminToken(email: string, name: string = 'Admin', id?: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadData: AdminPayload = {
    id,
    name,
    email,
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days expiry
  };
  const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.ADMIN_SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', env.ADMIN_SECRET_KEY)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decodedPayload: AdminPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );

    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired token
    }

    return decodedPayload;
  } catch {
    return null;
  }
}
