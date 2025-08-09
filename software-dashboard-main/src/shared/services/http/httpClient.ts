// =============================================================================
// HTTP CLIENT - Fetch con abort, retry/backoff y streaming NDJSON
// =============================================================================

export interface HttpRequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: TBody
  signal?: AbortSignal
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

export interface HttpResponse<T = unknown> {
  ok: boolean
  status: number
  data: T
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

function computeBackoff(attempt: number, baseDelayMs: number): number {
  const jitter = Math.random() * baseDelayMs
  return Math.min(30000, baseDelayMs * Math.pow(2, attempt)) + jitter
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number, signal?: AbortSignal): Promise<T> {
  if (!timeoutMs) return promise
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    promise.then((v) => { clearTimeout(id); resolve(v) }, (e) => { clearTimeout(id); reject(e) })
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(id)
        reject(new Error('Request aborted'))
      }, { once: true })
    }
  })
}

export class HttpClient {
  constructor(private readonly baseUrl: string = '') {}

  async request<TResponse = unknown, TBody = unknown>(path: string, options: HttpRequestOptions<TBody> = {}): Promise<HttpResponse<TResponse>> {
    const {
      method = 'GET',
      headers = {},
      body,
      signal,
      timeoutMs = 30000,
      retries = 2,
      retryDelayMs = 300,
    } = options

    const isJson = body !== undefined && typeof body !== 'string' && !(body instanceof FormData)
    const finalHeaders: Record<string, string> = {
      'Content-Type': isJson ? 'application/json' : headers['Content-Type'] || 'application/json',
      ...headers,
    }

    const exec = async (): Promise<HttpResponse<TResponse>> => {
      const res = await withTimeout(fetch(this.baseUrl + path, {
        method,
        headers: finalHeaders,
        body: body === undefined ? undefined : (isJson ? JSON.stringify(body) : (body as unknown as BodyInit)),
        signal,
      }), timeoutMs, signal)

      const contentType = res.headers.get('Content-Type') || ''
      const isJsonResponse = contentType.includes('application/json')
      const data = isJsonResponse ? await res.json() : await res.text()
      return { ok: res.ok, status: res.status, data }
    }

    let attempt = 0
    while (true) {
      try {
        const result = await exec()
        if (!result.ok && result.status >= 500 && attempt < retries) {
          // retry on server errors
          attempt += 1
          await sleep(computeBackoff(attempt, retryDelayMs))
          continue
        }
        return result
      } catch (err) {
        if (attempt >= retries) throw err
        attempt += 1
        await sleep(computeBackoff(attempt, retryDelayMs))
      }
    }
  }

  // Streaming de NDJSON (línea por línea) o texto chunked
  async stream<TChunk = unknown, TBody = unknown>(path: string, options: HttpRequestOptions<TBody> & { onMessage: (chunk: TChunk) => void }): Promise<void> {
    const { onMessage, ...rest } = options
    const res = await this.request<Response>(path, { ...rest } as HttpRequestOptions<TBody>)
    // Si viene como texto completo, intentar parsear como NDJSON
    const data = res.data as unknown
    if (typeof data === 'string') {
      for (const line of data.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try { onMessage(JSON.parse(trimmed)) } catch { /* noop */ }
      }
      return
    }
  }
}

export const httpClient = new HttpClient()

