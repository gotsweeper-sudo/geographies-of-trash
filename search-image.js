// /api/search-image  —  queries the IMAGE Pinecone index (visual vectors)
// Env needed: PINECONE_API_KEY, PINECONE_IMAGE_HOST  (the 2nd, image index)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { vector, topK = 24 } = req.body || {};
  if (!vector) return res.status(400).json({ error: 'Missing vector' });

  const response = await fetch(`${process.env.PINECONE_IMAGE_HOST}/query`, {
    method: 'POST',
    headers: {
      'Api-Key': process.env.PINECONE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vector,
      topK,
      includeMetadata: true,
      filter: { type: { '$eq': 'got' } }
    })
  });

  if (!response.ok) return res.status(500).json({ error: 'Pinecone image query failed' });
  const data = await response.json();
  return res.status(200).json({ matches: data.matches || [] });
}
