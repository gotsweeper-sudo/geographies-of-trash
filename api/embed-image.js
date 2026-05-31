// /api/embed-image  —  turns an uploaded photo into a CLIP image vector (Jina jina-clip-v2)
// Env needed: JINA_API_KEY
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { base64 } = req.body || {};
  if (!base64) return res.status(400).json({ error: 'Missing base64' });

  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'jina-clip-v2',
      dimensions: 1024,
      input: [{ image: base64 }]   // raw base64 (no data: prefix)
    })
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: 'Jina error: ' + err.slice(0, 200) });
  }
  const data = await response.json();
  const embedding = data && data.data && data.data[0] && data.data[0].embedding;
  if (!embedding) return res.status(500).json({ error: 'No embedding returned' });
  return res.status(200).json({ embedding });
}
