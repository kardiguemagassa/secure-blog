export type Role = 'ROLE_USER' | 'ROLE_ADMIN'

export interface ProblemDetail {
    type?: string
    title?: string
    status: number
    detail?: string
    instance?: string
    errors?: Record<string, string>
}

export interface Page<T> {
    content: T[]
    page: {
        size: number
        number: number
        totalElements: number
        totalPages: number
    }
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
}

export interface AuthResponse {
    accessToken: string
    tokenType: 'Bearer'
}

export interface UserResponse {
    id: string
    username: string
    email: string
    role: Role
}

export interface PostRequest {
    title: string
    content: string
}

export interface PostResponse {
    id: string
    title: string
    content: string
    authorId: string
    authorUsername: string
    createdAt: string
    updatedAt: string
}