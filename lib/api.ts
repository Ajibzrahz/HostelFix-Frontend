export type ApiErrorDetails = {
  field?: string
  message: string
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: ApiErrorDetails[]

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: ApiErrorDetails[],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T | undefined> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body,
    credentials: 'include',
  })

  if (response.status === 204) return undefined

  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    const error = payload?.error
    throw new ApiError(
      response.status,
      error?.message ?? friendlyStatusMessage(response.status),
      error?.code,
      error?.details,
    )
  }

  return payload as T
}

function friendlyStatusMessage(status: number) {
  switch (status) {
    case 401:
      return 'Your session has ended. Please log in again.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'We could not find what you requested.'
    case 409:
      return 'This request conflicts with the current data.'
    case 413:
      return 'That request is too large.'
    case 429:
      return 'Too many requests. Please wait and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
