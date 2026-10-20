import { describe, expect, it } from 'vitest'
import { parsePage } from './pagination'

describe('parsePage', () => {
  it('reads a valid page number', () => {
    expect(parsePage('3')).toBe(3)
  })

  it.each([null, '', 'abc', '0', '-2', '1.5'])('falls back to page 1 for %j', (value) => {
    expect(parsePage(value)).toBe(1)
  })
})
