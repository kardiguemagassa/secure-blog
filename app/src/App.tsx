import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('Checking API…')

  useEffect(() => {
    fetch('/api/posts')
        .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
        .then((page) => setStatus(`API OK: ${page.page.totalElements} post(s)`))
        .catch((error) => setStatus(`API error: ${error}`))
  }, [])

  return (
      <main>
        <h1>Secure Blog</h1>
        <p>{status}</p>
      </main>
  )
}