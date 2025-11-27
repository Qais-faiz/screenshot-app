// Vercel serverless entry point
// This needs to be a proper Vercel function handler

export default async function handler(req, res) {
  try {
    // Import the Hono app handlers dynamically
    const { default: handleRequest, GET, POST, PUT, PATCH, DELETE, OPTIONS } = await import('../build/server/index.js');
    
    // Map method to handler
    const handlers = { GET, POST, PUT, PATCH, DELETE, OPTIONS };
    const methodHandler = handlers[req.method];
    
    if (!methodHandler) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create a Web API Request from Vercel request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url || '/', `${protocol}://${host}`);
    
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Call the Hono handler
    const response = await methodHandler(request);
    
    // Convert Web API Response to Vercel response
    const body = await response.text();
    
    // Set headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Send response
    return res.status(response.status).send(body);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
