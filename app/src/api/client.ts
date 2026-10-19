import { tokenStorage } from '../auth/tokenStorage'
import type { ProblemDetail } from '../types/api'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export class ApiError extends Error {
    readonly status: number
    readonly problem?: ProblemDetail

    constructor(status: number, problem?: ProblemDetail) {
        super(problem?.detail ?? `Request failed with status ${status}`)
        this.name = 'ApiError'
        this.status = status
        this.problem = problem
    }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const token = tokenStorage.get()
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(path, { ...init, headers })

    // token expiré ou invalide : on déconnecte. Un 401 sans token (mauvais identifiants au login) n'est pas concerné.
    if (response.status === 401 && token) {
        tokenStorage.clear()
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    if (!response.ok) {
        throw new ApiError(response.status, await readProblem(response))
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}

async function readProblem(response: Response): Promise<ProblemDetail | undefined> {
    const contentType = response.headers.get('Content-Type') ?? ''
    if (!contentType.includes('json')) {
        return undefined // les 401 et 403 du filter chain n'ont pas de body
    }
    try {
        return (await response.json()) as ProblemDetail
    } catch {
        return undefined
    }
}