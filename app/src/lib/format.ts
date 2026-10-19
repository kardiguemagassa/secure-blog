const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function excerpt(text: string, maxLength = 200): string {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength).trimEnd()}…`
}
