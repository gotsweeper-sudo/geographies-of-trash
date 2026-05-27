export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
  });

  if (!response.ok) {
    const err = await response.json();
    return res.status(500).json({ error: err.error?.message || 'OpenAI error' });
  }

  const data = await response.json();
  return res.status(200).json({ embedding: data.data[0].embedding });
}
