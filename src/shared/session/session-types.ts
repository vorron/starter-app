import { z } from 'zod';

export const SessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.enum(['user', 'admin']),
});

export const SessionSchema = z.object({
  user: SessionUserSchema,
  expires: z.string().datetime(),
});

export type SessionUser = z.infer<typeof SessionUserSchema>;
export type Session = z.infer<typeof SessionSchema>;
