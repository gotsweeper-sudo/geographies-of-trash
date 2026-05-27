export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  // Only allow Instagram CDN domains
  const allowed = ['cdninstagram.com', 'fbcdn.net'];
  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).send('Invalid url'); }
  if (!allowed.some(d => parsed.hostname.endsWith(d))) {
    return res.status(403).send('Domain not allowed');
  }

  const upstream = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.instagram.com/' }
  });

  if (!upstream.ok) return res.status(upstream.status).send('Upstream error');

  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const buf = await upstream.arrayBuffer();
  res.send(Buffer.from(buf));
}
