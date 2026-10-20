import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { applyServerValidationErrors } from './formErrors'

describe('applyServerValidationErrors', () => {
  it('maps the field errors of a 400 response onto the form', () => {
    const setError = vi.fn()
    const error = new ApiError(400, {
      status: 400,
      errors: { title: 'must not be blank', content: 'size must be at most 20000' },
    })

    expect(applyServerValidationErrors(error, setError)).toBe(true)
    expect(setError).toHaveBeenCalledTimes(2)
    expect(setError).toHaveBeenCalledWith('title', { message: 'must not be blank' })
  })

  it('ignores an error with another status', () => {
    const setError = vi.fn()
    const error = new ApiError(409, { status: 409, detail: 'Email already in use' })

    expect(applyServerValidationErrors(error, setError)).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })

  it('ignores a 400 response without field errors', () => {
    const setError = vi.fn()

    expect(applyServerValidationErrors(new ApiError(400), setError)).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })

  it('ignores an error that does not come from the API', () => {
    const setError = vi.fn()

    expect(applyServerValidationErrors(new Error('Network down'), setError)).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })
})
