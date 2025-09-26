import { z } from 'zod'

export const emailSchema = z
  .email({ message: 'Please enter a valid email address' })
  .min(1, { message: 'Email is required' })
  .max(254, { message: 'Email is too long' })
  .transform(val => val.trim().toLowerCase())

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(30, 'Name must be 30 characters or less')
  .regex(
    /^[A-Za-z\s\u00C0-\u017F]+$/,
    'Name can only contain letters and spaces'
  )
  .transform(val => val.trim())

export const userInformationSchema = z.object({
  full_name: nameSchema.optional().or(z.literal('')),
  email: emailSchema,
})

export const userInformationUpdateSchema = z
  .object({
    full_name: nameSchema.optional(),
    email: emailSchema.optional(),
  })
  .refine(data => data.full_name !== undefined || data.email !== undefined, {
    error: 'At least one field must be provided',
  })

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    error: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
  confirmation: z.literal('DELETE', {
    error: 'Please type "DELETE" to confirm',
  }),
})

export const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    error: 'Please select a valid theme',
  }),
})

export const loginSchema = z.object({
  username: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registrationSchema = z
  .object({
    full_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.password === data.confirm_password, {
    error: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const passwordRecoverySchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    error: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const itemCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .transform(val => val.trim()),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .transform(val => val?.trim())
    .optional(),
})

export const itemUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .transform(val => val.trim()),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .transform(val => val?.trim()),
})

export const adminUserCreateSchema = z
  .object({
    email: emailSchema,
    full_name: nameSchema.optional(),
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Password confirmation is required'),
    is_superuser: z.boolean().default(false),
  })
  .refine(data => data.password === data.confirm_password, {
    error: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const adminUserUpdateSchema = z
  .object({
    email: emailSchema,
    full_name: nameSchema.optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .optional(),
    confirm_password: z.string().optional(),
    is_superuser: z.boolean().default(false),
  })
  .refine(
    data => {
      if (data.password && !data.confirm_password) {
        return false
      }
      if (data.password && data.confirm_password) {
        return data.password === data.confirm_password
      }
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['confirm_password'],
    }
  )

export const adminUserDeleteSchema = z.object({
  confirmation: z.literal('DELETE', {
    error: 'Please type "DELETE" to confirm',
  }),
})

export type UserInformationInput = z.infer<typeof userInformationSchema>
export type UserInformationUpdateInput = z.infer<
  typeof userInformationUpdateSchema
>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
export type AppearanceInput = z.infer<typeof appearanceSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
export type PasswordRecoveryInput = z.infer<typeof passwordRecoverySchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ItemCreateInput = z.infer<typeof itemCreateSchema>
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>
export type AdminUserDeleteInput = z.infer<typeof adminUserDeleteSchema>
