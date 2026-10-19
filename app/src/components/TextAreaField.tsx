import type { ComponentProps } from 'react'

interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
}

export function TextAreaField({ label, error, id, ...textareaProps }: TextAreaFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...textareaProps}
      />
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
