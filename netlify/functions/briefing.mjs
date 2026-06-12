// GET /api/briefing — devolve o briefing publicado (Netlify Blobs).
// Se não houver nada publicado (ou o store falhar), responde 204 e o app cai
// pro briefing.json estático do deploy. Nunca derruba (sempre 204 no erro).
export default async () => {
  try {
    const { getStore } = await import('@netlify/blobs')
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
  // 204 é "null body status": o corpo precisa ser null (passar '' lança no
  // construtor de Response → 502).
  return new Response(null, { status: 204 })
}

export const config = { path: '/api/briefing' }
