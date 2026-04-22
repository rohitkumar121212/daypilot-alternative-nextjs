export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  const response = await fetch(
    'https://fastapi.thesqua.re/api/v1/test/random-stream',
    { headers: { Accept: 'text/event-stream' } }
  )

  if (!response.ok || !response.body) {
    return new Response('Failed to connect to SSE source', { status: 502 })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
