import { corsHeaders } from './cors.ts'

export interface EdgeFnEnvelope<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function ok<T>(data: T, status = 200): Response {
  const body: EdgeFnEnvelope<T> = { success: true, data }
  return new Response(JSON.stringify(body), { headers: corsHeaders, status })
}

export function fail(message: string, status = 400): Response {
  const body: EdgeFnEnvelope<never> = { success: false, error: message }
  return new Response(JSON.stringify(body), { headers: corsHeaders, status })
}


