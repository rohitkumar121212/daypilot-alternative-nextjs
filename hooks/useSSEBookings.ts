import { useEffect, useRef, useCallback } from 'react'

export type SSEEventType = 'reservation.created' | 'reservation.updated' | 'reservation.deleted'

export interface SSEReservationEvent {
  type: SSEEventType
  data: any
}

interface UseSSEBookingsParams {
  startDate: string
  endDate: string
  onEvent: (event: SSEReservationEvent) => void
  enabled: boolean
}

const MIN_RETRY_MS = 3_000
const MAX_RETRY_MS = 30_000

export function useSSEBookings({ startDate, endDate, onEvent, enabled }: UseSSEBookingsParams) {
  const retryDelay = useRef(MIN_RETRY_MS)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Keep onEvent stable across renders without re-triggering the effect
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(async (signal: AbortSignal) => {
    const url = `/api/proxy/sse-reservations?start=${startDate}&end=${endDate}`
    console.log('[SSE] Connecting to', url)

    let response: Response

    try {
      response = await fetch(url, { signal, headers: { Accept: 'text/event-stream' } })
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[SSE] Connection aborted (cleanup or date change)')
        return
      }
      console.warn('[SSE] Fetch failed, will retry in', retryDelay.current, 'ms', err)
      scheduleRetry(signal)
      return
    }

    if (!response.ok) {
      console.error('[SSE] Upstream returned', response.status, '— will retry')
      scheduleRetry(signal)
      return
    }

    if (!response.body) {
      console.error('[SSE] No response body — will retry')
      scheduleRetry(signal)
      return
    }

    console.log('[SSE] Stream open ✓')
    retryDelay.current = MIN_RETRY_MS // reset back-off on successful connect

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.warn('[SSE] Stream ended by server, will retry')
          scheduleRetry(signal)
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // SSE events are separated by double newlines
        const events = buffer.split(/\n\n/)
        // Last slice may be an incomplete event — keep it in the buffer
        buffer = events.pop() ?? ''

        for (const raw of events) {
          parseAndDispatch(raw)
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[SSE] Stream read aborted (cleanup)')
        return
      }
      console.warn('[SSE] Stream read error, will retry', err)
      scheduleRetry(signal)
    }
  }, [startDate, endDate]) // eslint-disable-line react-hooks/exhaustive-deps

  function parseAndDispatch(raw: string) {
    const lines = raw.split('\n')
    let eventType: string | null = null
    const dataLines: string[] = []

    for (const line of lines) {
      if (line.startsWith(':')) continue // heartbeat / comment
      if (line.startsWith('event:')) {
        eventType = line.slice('event:'.length).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice('data:'.length).trim())
      }
    }

    if (dataLines.length === 0) return

    const rawJson = dataLines.join('')
    let parsed: any

    try {
      parsed = JSON.parse(rawJson)
    } catch {
      console.warn('[SSE] Could not parse event JSON:', rawJson)
      return
    }

    // Accept type from the SSE `event:` field OR from inside the JSON payload
    const type: SSEEventType = (eventType ?? parsed?.type) as SSEEventType

    if (!type) {
      console.warn('[SSE] Event has no type, skipping:', parsed)
      return
    }

    console.log('[SSE] Event received:', type, parsed)
    onEventRef.current({ type, data: parsed?.data ?? parsed })
  }

  function scheduleRetry(signal: AbortSignal) {
    if (signal.aborted) return
    console.log(`[SSE] Reconnecting in ${retryDelay.current / 1000}s…`)
    retryTimer.current = setTimeout(() => {
      if (!signal.aborted) connect(signal)
    }, retryDelay.current)
    retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_MS)
  }

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    abortRef.current = controller

    connect(controller.signal)

    return () => {
      controller.abort()
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [enabled, connect])
}
