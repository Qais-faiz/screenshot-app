// Vercel API Route - Direct handler
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Import the server module
    const { GET, POST, PUT, PATCH, DELETE, OPTIONS } = await import('./server');
    
    // Map HTTP method to handler
    const handlers: Record<string, any> = { GET, POST, PUT, PATCH, DELETE, OPTIONS };
    const handler = handlers[req.method || 'GET'];
    
    if (!handler) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create Web API Request from Vercel request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url || '/', `${protocol}://${host}`);
    
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Call the handler
    const response = await handler(request);
    
    // Convert Response to Vercel response
    const body = await response.text();
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    return res.status(response.status).send(body);
  } catch (error: any) {
    console.error('API handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
