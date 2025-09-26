import { z, ZodError } from 'zod'

/**
 * Utility function to validate data against a Zod schema
 * Returns validation result with success/error information
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true as const,
      data: validatedData,
      error: null,
      errors: null,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false as const,
        data: null,
        error: error.issues[0]?.message || 'Validation failed',
        errors: error.issues,
      }
    }
    return {
      success: false as const,
      data: null,
      error: 'Unknown validation error',
      errors: [],
    }
  }
}

/**
 * Utility function to safely validate data and return only the data or null
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = validateData(schema, data)
  return result.success ? result.data : null
}

/**
 * Utility function to get validation error message for a specific field
 * FIX: Use the stable core type z.core.$ZodIssue[]
 */
export function getFieldError(
  errors: z.core.$ZodIssue[],
  fieldName: string
): string | null {
  const fieldError = errors.find(
    error => error.path.length > 0 && error.path[0] === fieldName
  )
  return fieldError?.message || null
}

/**
 * Transform Zod errors into a format suitable for react-hook-form
 * FIX: Use the stable core type z.core.$ZodIssue[]
 */
export function transformZodErrors(errors: z.core.$ZodIssue[]) {
  const formErrors: Record<string, { message: string }> = {}

  errors.forEach(error => {
    const fieldName = error.path.join('.')
    if (fieldName) {
      formErrors[fieldName] = { message: error.message }
    }
  })

  return formErrors
}
