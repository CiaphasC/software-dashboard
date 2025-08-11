// =============================================================================
// GET-CATALOGS-TS - Router REST de catálogos transversales (Hono)
// =============================================================================
// Objetivo: Exponer catálogos (departamentos, roles) de forma clara y tipada.
// Diseño: Router Hono con middlewares, controladores por recurso y contratos
//         validados. Tipos centralizados en app/types/*.
// =============================================================================

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { z } from 'zod'
import { getDepartments } from "@controllers/getDepartments.ts"
import { getRoles } from "@controllers/getRoles.ts"

// Validaciones ligeras con Zod para garantizar estabilidad de contratos ante refactors
const DepartmentsResponse = z.object({ departments: z.array(z.object({ id: z.number(), name: z.string(), short_name: z.string(), is_active: z.boolean() })) })
const RolesResponse = z.object({ roles: z.array(z.object({ id: z.number(), name: z.string(), description: z.string(), is_active: z.boolean() })) })

const functionName = 'get-catalogs-ts'
const app = new Hono().basePath(`/${functionName}`)

app.use('/*', cors())
app.use('/*', logger())

app.get('/departments', async (c) => {
  const res = await getDepartments(c as any)
  const parsed = DepartmentsResponse.safeParse(await res.clone().json())
  if (!parsed.success) return c.json({ error: 'Contrato inválido en departamentos' }, 500)
  return res
})

app.get('/roles', async (c) => {
  const res = await getRoles(c as any)
  const parsed = RolesResponse.safeParse(await res.clone().json())
  if (!parsed.success) return c.json({ error: 'Contrato inválido en roles' }, 500)
  return res
})

// Back-compat: POST devuelve ambos catálogos
app.post('/', async (c) => {
  const depRes = await getDepartments(c as any)
  const roleRes = await getRoles(c as any)
  const deps = await depRes.json()
  const roles = await roleRes.json()
  return c.json({ success: true, departments: deps.departments ?? [], roles: roles.roles ?? [] })
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: err.message }, 400)
})

Deno.serve(app.fetch)