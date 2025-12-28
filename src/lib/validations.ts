import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /[@!$%^&*|]/,
    'Password must contain at least one special character (@!$%^&*|)'
  );

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  );

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const signupSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
