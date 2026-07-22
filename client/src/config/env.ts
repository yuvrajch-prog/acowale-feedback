import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().default('/api/v1'),
});

const parseResult = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

if (!parseResult.success) {
  console.warn('⚠️ Frontend environment validation warnings:', parseResult.error.format());
}

export const env = parseResult.success 
  ? parseResult.data 
  : { VITE_API_URL: '/api/v1' };
