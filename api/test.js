// Simple test endpoint to debug POST requests
export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    method: req.method,
    hasBody: Boolean(req.body),
    body: req.body,
    headers: {
      contentType: req.headers['content-type'],
      auth: req.headers.authorization ? 'present' : 'missing',
    },
    timestamp: new Date().toISOString(),
  })
}
