function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    return cleanPath
  }

  return `${normalizeBaseUrl(baseUrl)}${cleanPath}`
}
