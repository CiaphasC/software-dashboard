import { logger } from '@/shared/utils/logger'

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try { return JSON.stringify(error) } catch { return String(error) }
}

export function logAndExtractError(context: string, error: unknown): string {
  logger.error(`[${context}]`, error)
  return toErrorMessage(error)
}

