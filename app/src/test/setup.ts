import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// démonte les composants rendus entre deux tests, pour qu'ils restent indépendants
afterEach(() => {
  cleanup()
})
