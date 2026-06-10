const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export function get<T>(path: string, token?: string) {
  return request<T>(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export function post<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
