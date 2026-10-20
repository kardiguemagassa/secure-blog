const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function excerpt(text: string, maxLength = 200): string {
  const singleParagraph = text.replace(/\s+/g, ' ').trim()
  if (singleParagraph.length <= maxLength) {
    return singleParagraph
  }
  const cut = singleParagraph.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`
}
