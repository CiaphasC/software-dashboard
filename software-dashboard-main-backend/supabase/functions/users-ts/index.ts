// =============================================================================
// USERS-TS - Router REST con Hono para gestión de usuarios
// =============================================================================
// Propósito: Exponer endpoints RESTful para listar, obtener, crear,
//            actualizar y eliminar usuarios del sistema, aplicando RBAC.
// Diseño:    Arquitectura por capas (router -> middlewares -> controllers -> services)
// Rutas:     BasePath '/users-ts' para alinear con nombre de función en Supabase Edge.
// Seguridad: Autenticación vía Bearer token y autorización declarativa por capacidades.
// Comentarios: Estilo profesional, descripciones claras de contratos y reglas de negocio.
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Controllers
import { listUsers } from '@controllers/listUsers.ts'
import { getUser } from '@controllers/getUser.ts'
import { createUser } from '@controllers/createUser.ts'
import { updateUser } from '@controllers/updateUser.ts'
import { deleteUser } from '@controllers/deleteUser.ts'
import { registerUser } from '@controllers/registerUser.ts'

// Middlewares (importes absolutos)
import { withClients } from '@middlewares/withClients.ts'
import { auth, authorize } from '@middlewares/authz.ts'
import { validate } from '@middlewares/validate.ts'

// Schemas (validación de entrada)
import {
  CreateUserSchema,
  UpdateUserSchema,
  RegisterUserSchema,
} from '@schemas/user.schema.ts'

// Base path alineado con el nombre de la función para evitar 404 en el runtime
const app = new Hono().basePath('/users-ts')

app.use('/*', cors())
app.use('/*', logger())
app.use('/*', withClients) // deja supa admin en c.get('supa')

// Salud y diagnóstico de función
app.get('/health', (c) => c.json({ ok: true, fn: 'users-ts' }))

// Listado y detalle (requiere autenticación + autorización por capacidad)
app.get('/', auth, authorize('users:list'), listUsers)
app.get('/:id', auth, authorize('users:get'), getUser)

// Mutaciones (creación, actualización parcial y borrado)
app.post('/', auth, authorize('users:create'), validate(CreateUserSchema), createUser)
app.patch('/:id', auth, authorize('users:update'), validate(UpdateUserSchema), updateUser)
app.delete('/:id', auth, authorize('users:delete'), deleteUser)

// Registro público (solicitud de registro) - No requiere auth
app.post('/register', validate(RegisterUserSchema), registerUser)

// Manejador global de errores no controlados
app.onError((err, c) => {
  console.error(err)
  return c.json(
    { type: 'about:blank', title: 'UnhandledError', detail: err?.message ?? String(err) },
    500,
  )
})

Deno.serve(app.fetch)


