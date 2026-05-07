export default async function handler(req, res) {
  // Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt tidak boleh kosong' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Aman! Disimpan di Vercel, bukan di kode
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ message: err.error?.message || 'API error' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
}
