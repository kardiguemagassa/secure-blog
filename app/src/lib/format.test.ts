import { describe, expect, it } from 'vitest'
import { excerpt } from './format'

describe('excerpt', () => {
  it('returns a short text unchanged', () => {
    expect(excerpt('Hello world', 50)).toBe('Hello world')
  })

  it('cuts on a word boundary and adds an ellipsis', () => {
    expect(excerpt('The quick brown fox jumps', 12)).toBe('The quick…')
  })

  it('flattens line breaks and repeated spaces', () => {
    expect(excerpt('First line\n\nSecond   line', 100)).toBe('First line Second line')
  })

  it('cuts a single long word at the limit', () => {
    expect(excerpt('Supercalifragilistic', 5)).toBe('Super…')
  })
})
