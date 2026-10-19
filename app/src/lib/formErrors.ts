import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '../api/client'

export function applyServerValidationErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>,): boolean {
    if (!(error instanceof ApiError) || error.status !== 400 || !error.problem?.errors) {
        return false
    }

    for (const [field, message] of Object.entries(error.problem.errors)) {
        setError(field as Path<T>, { message })
    }
    return true
}