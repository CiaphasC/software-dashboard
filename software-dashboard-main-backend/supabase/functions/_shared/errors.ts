export function problem(c: any, status: number, title: string, detail?: unknown) {
  return c.json({ type: 'about:blank', title, detail }, status)
}


