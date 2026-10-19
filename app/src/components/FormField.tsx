import type { ComponentProps } from 'react'

interface FormFieldProps extends ComponentProps<'input'> {
    label: string
    error?: string
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
    const errorId = `${id}-error`

    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                {...inputProps}
            />
            {error && (
                <p id={errorId} role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}