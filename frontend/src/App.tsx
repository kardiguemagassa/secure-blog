import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './index.css'

type AuthResponse = {
  token: string
}

type Post = {
  id: number
  title: string
  content: string
  author: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [token, setToken] = useState(localStorage.getItem('token') ?? '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void loadPosts()
  }, [])

  async function loadPosts() {
    const response = await fetch(`${API_URL}/api/posts`)
    if (!response.ok) {
      setMessage('Unable to load posts')
      return
    }
    setPosts((await response.json()) as Post[])
  }

  async function handleAuth(path: 'register' | 'login') {
    const response = await fetch(`${API_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      setMessage(`Failed to ${path}`)
      return
    }

    const data = (await response.json()) as AuthResponse
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setMessage(`Successfully ${path}ed`)
  }

  async function handleCreatePost(event: FormEvent) {
    event.preventDefault()
    if (!token) {
      setMessage('Login required to create posts')
      return
    }

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ title, content }),
    })

    if (!response.ok) {
      setMessage('Failed to create post')
      return
    }

    setTitle('')
    setContent('')
    setMessage('Post created')
    await loadPosts()
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken('')
    setMessage('Logged out')
  }

  return (
    <main className="container">
      <h1>Secure Blog</h1>
      {message && <p>{message}</p>}

      <section className="card">
        <h2>Authentication</h2>
        <form>
          <input
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="actions">
            <button type="button" onClick={() => void handleAuth('login')}>
              Login
            </button>
            <button type="button" onClick={() => void handleAuth('register')}>
              Register
            </button>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Create Post</h2>
        <form onSubmit={(event) => void handleCreatePost(event)}>
          <input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <textarea
            placeholder="Write your post"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
          <button type="submit">Publish</button>
        </form>
      </section>

      <section className="card">
        <h2>Posts</h2>
        {posts.map((post) => (
          <article key={post.id}>
            <h3>{post.title}</h3>
            <small>By {post.author}</small>
            <p>{post.content}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
