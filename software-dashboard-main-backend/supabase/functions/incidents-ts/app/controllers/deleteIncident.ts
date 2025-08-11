/**
 * DELETE /incidents-ts/:id
 * Elimina una incidencia. Requiere admin/technician.
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser, ensureAdminOrTechnician } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"

export async function deleteIncident(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    await ensureAdminOrTechnician(supa, user.id)

    const id = c.req.param("id")
    if (!id) return problem(c, 400, "BadRequest", "missing id")

    const { error: delErr } = await supa.from("incidents").delete().eq("id", id)
    if (delErr) return problem(c, 409, "DeleteFailed", delErr.message)

    return c.json({ ok: true })
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


