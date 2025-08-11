// =============================================================================
// MIDDLEWARE: validate (Zod)
// =============================================================================
// Propósito: Validar el cuerpo de la solicitud con un esquema de Zod y exponer
//            el resultado tipado en el contexto bajo la clave 'dto'.
// Contrato:  Si la validación falla, retorna 400 con detalle de errores.
// =============================================================================
import type { Context, Next } from 'hono'
import { z } from 'zod'

export const validate = <T extends z.ZodTypeAny>(schema: T) =>
  async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => undefined)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return c.json({ type: 'about:blank', title: 'ValidationError', detail: parsed.error.format() }, 400)
    }
    c.set('dto', parsed.data as z.infer<T>)
    await next()
  }