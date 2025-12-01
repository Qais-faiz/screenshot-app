// Simple test endpoint
export default function handler(req: any, res: any) {
  return res.status(200).json({ 
    message: 'Vercel serverless function works!',
    method: req.method,
    url: req.url 
  });
}
