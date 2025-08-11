import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { createIncident } from "@controllers/createIncident.ts"
import { getIncidents } from "@controllers/getIncidents.ts"
import { updateIncident } from "@controllers/updateIncident.ts"
import { deleteIncident } from "@controllers/deleteIncident.ts"
import { getIncidentDetails } from "@controllers/getIncidentDetails.ts"
import { getIncidentMetrics } from "@controllers/getIncidentMetrics.ts"
import { updateIncidentStatus } from "@controllers/updateIncidentStatus.ts"
import { getIncidentPermissions } from "@controllers/getIncidentPermissions.ts"

// Rutas absolutas: basePath = nombre de la función
const app = new Hono().basePath('/incidents-ts')

app.use('/*', cors())
app.use('/*', logger())

// Salud y diagnósticos
app.get('/health', (c) => c.json({ ok: true, fn: 'incidents' }))

// Listado y métricas
app.get('/', getIncidents)
app.get('/metrics/summary', getIncidentMetrics)

// Permisos de UI
app.get('/permissions', getIncidentPermissions)
app.get('/:id/permissions', getIncidentPermissions)

// Detalle
app.get('/:id', getIncidentDetails)

// Mutaciones
app.post('/', createIncident)
app.patch('/:id', updateIncident)
app.post('/:id/status', updateIncidentStatus)
app.delete('/:id', deleteIncident)

app.onError((err, c) => {
  console.error(err)
  return c.json({ type: 'about:blank', title: 'UnhandledError', detail: err.message }, 500)
})

Deno.serve(app.fetch)


