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

// Streaming SSE via fetch POST.
// EventSource natif ne supporte que GET sans headers custom —
// on parse les lignes "data: {...}" manuellement depuis un ReadableStream.
export async function streamPost(
  path: string,
  body: unknown,
  token: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    onError(err.message ?? 'Erreur serveur')
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // { stream: true } = décodage incrémental : ne flush pas les séquences
    // multi-bytes incomplètes, les garde pour le prochain appel.
    buffer += decoder.decode(value, { stream: true })

    // On split sur \n et on remet la dernière ligne (potentiellement
    // incomplète) dans le buffer pour le prochain chunk réseau.
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const parsed = JSON.parse(line.slice(6)) as { type: string; content?: string; message?: string }
        if (parsed.type === 'chunk' && parsed.content) onChunk(parsed.content)
        else if (parsed.type === 'done') onDone()
        else if (parsed.type === 'error') onError(parsed.message ?? 'Erreur streaming')
      } catch {
        // JSON incomplet dans le buffer — sera complété au prochain chunk.
      }
    }
  }
}
