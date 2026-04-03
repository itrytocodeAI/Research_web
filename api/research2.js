// Test research endpoint without imports
export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    method: req.method,
    hasBody: Boolean(req.body),
    body: req.body,
    topic: req.body?.topic,
    headers: {
      contentType: req.headers['content-type'],
      auth: req.headers.authorization ? 'present' : 'missing',
    },
    timestamp: new Date().toISOString(),
  })
}
