'use client'

import { useState, useRef } from 'react'

const randomNumberGenerator = () => Math.floor(Math.random() * 100)
const DIRECT_URL = `https://fastapi.thesqua.re/api/v1/test/random-stream?p=${randomNumberGenerator()}`
const PROXY_URL = '/api/sse-test'

const SSEClientPage = () => {
  const [messages, setMessages] = useState<{ id: string; type: string; data: string }[]>([])
  const [connected, setConnected] = useState(false)
  const [mode, setMode] = useState<'proxy' | 'direct'>('proxy')
  const eventSourceRef = useRef<EventSource | null>(null)

  const handleEvent = (type: string) => (event: MessageEvent) => {
    setMessages((prev) => [
      ...prev,
      { id: event.lastEventId || '', type, data: event.data },
    ])
  }

  const connect = () => {
    if (eventSourceRef.current) return

    const url = mode === 'direct' ? DIRECT_URL : PROXY_URL
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onopen = () => {
      setConnected(true)
    }

    es.addEventListener('message', handleEvent('message'))
    es.addEventListener('new_random', handleEvent('new_random'))

    es.onerror = () => {
      setConnected(false)
      es.close()
      eventSourceRef.current = null
    }
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setConnected(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>SSE Test</h1>
      <p style={{ marginBottom: 8, color: '#6b7280' }}>
        Source: <code>https://fastapi.thesqua.re/api/v1/test/random-stream</code>
      </p>
      <p style={{ marginBottom: 16, color: '#6b7280' }}>
        Proxy: <code>/api/sse-test</code>
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="radio" name="mode" checked={mode === 'proxy'} onChange={() => setMode('proxy')} disabled={connected} />
          Proxy (/api/sse-test)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="radio" name="mode" checked={mode === 'direct'} onChange={() => setMode('direct')} disabled={connected} />
          Direct (FastAPI)
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={connect}
          disabled={connected}
          style={{
            padding: '8px 16px',
            background: connected ? '#ccc' : '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: connected ? 'default' : 'pointer',
          }}
        >
          Connect
        </button>
        <button
          onClick={disconnect}
          disabled={!connected}
          style={{
            padding: '8px 16px',
            background: !connected ? '#ccc' : '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: !connected ? 'default' : 'pointer',
          }}
        >
          Disconnect
        </button>
        <button
          onClick={() => setMessages([])}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: connected ? '#22c55e' : '#ef4444',
            display: 'inline-block',
          }}
        />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
        <span style={{ color: '#9ca3af' }}>({messages.length} messages)</span>
      </div>

      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 8,
          height: 400,
          overflowY: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {messages.length === 0 ? (
          <span style={{ color: '#6b7280' }}>Click Connect to start receiving events...</span>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <span style={{ color: '#6b7280' }}>{i + 1}.</span>{' '}
              <span style={{ color: '#f59e0b' }}>id:</span> {msg.id || '-'}{' '}
              <span style={{ color: '#22c55e' }}>type:</span> {msg.type}{' '}
              <span style={{ color: '#60a5fa' }}>data:</span> {msg.data}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SSEClientPage
