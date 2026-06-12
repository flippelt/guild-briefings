// POST /api/publish — guarda o briefing publicado (Netlify Blobs).
// Protegido por senha no header `x-publish-key` (conferida com PUBLISH_KEY).
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const expected = process.env.PUBLISH_KEY
  if (!expected) return new Response('publish disabled', { status: 503 })
  if (req.headers.get('x-publish-key') !== expected) return new Response('forbidden', { status: 403 })

  let body
  try {
    body = await req.text()
    JSON.parse(body) // valida
  } catch {
    return new Response('bad json', { status: 400 })
  }

  try {
    const { getStore } = await import('@netlify/blobs')
    const store = getStore('guild')
    await store.set('briefing', body)
  } catch (e) {
    // surfaça o erro real do store pra diagnóstico
    return new Response('store error: ' + (e && e.message ? e.message : String(e)), { status: 500 })
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  })
}

export const config = { path: '/api/publish' }
