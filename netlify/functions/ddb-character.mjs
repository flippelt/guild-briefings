// Proxy server-side pro endpoint não-oficial de personagens do D&D Beyond.
// Roda no deploy do Netlify (mesma origem do app → sem CORS) e busca a ficha
// pública pelo ID. Não guarda nada; só repassa o JSON.
export async function handler(event) {
  const id = event.queryStringParameters && event.queryStringParameters.id
  if (!id || !/^\d+$/.test(id)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'id inválido' }) }
  }
  try {
    const res = await fetch(
      `https://character-service.dndbeyond.com/character/v5/character/${id}`,
      { headers: { Accept: 'application/json', 'User-Agent': 'guild-briefings' } },
    )
    const body = await res.text()
    return {
      statusCode: res.status,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store',
      },
      body,
    }
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: String(err) }) }
  }
}
