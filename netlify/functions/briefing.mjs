// GET /api/briefing — devolve o briefing publicado (Netlify Blobs).
// Se ainda não houver nada publicado, responde 204 e o app cai pro
// briefing.json estático do deploy.
import { getStore } from '@netlify/blobs'

export default async () => {
  try {
    const store = getStore('guild')
    const data = await store.get('briefing')
    if (data) {
      return new Response(data, {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      })
    }
  } catch {
    /* sem blob / store indisponível → o app usa o estático */
  }
  return new Response('', { status: 204 })
}

export const config = { path: '/api/briefing' }
