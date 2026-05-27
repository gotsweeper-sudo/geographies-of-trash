export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { base64, mimeType } = req.body;
  if (!base64 || !mimeType) return res.status(400).json({ error: 'Missing base64 or mimeType' });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 120,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' } },
        { type: 'text', text: 'Describe this image for finding similar street art pieces: colors, materials, object type, surface, setting. 40-60 words.' }
      ]}]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    return res.status(500).json({ error: err.error?.message || 'OpenAI error' });
  }

  const data = await response.json();
  return res.status(200).json({ description: data.choices[0].message.content.trim() });
}
