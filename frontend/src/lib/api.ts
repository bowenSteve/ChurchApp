const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: async <T>(path: string, file: File): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)
    // No Content-Type header here — the browser sets multipart/form-data
    // with the correct boundary itself when the body is a FormData instance.
    const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', body: formData })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`${res.status} ${res.statusText}: ${body}`)
    }
    return res.json() as Promise<T>
  },
  download: async (path: string, fallbackFilename: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}${path}`)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`${res.status} ${res.statusText}: ${body}`)
    }
    const disposition = res.headers.get('Content-Disposition') ?? ''
    const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackFilename
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}

// Uploaded image URLs come back as backend-relative paths (e.g. "/uploads/x.png");
// resolve them against the API origin so <img> tags load correctly.
export function resolveImageUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  return `${BASE_URL}${url}`
}
