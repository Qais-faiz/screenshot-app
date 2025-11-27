// Vercel serverless entry point
// Re-export the default handler from the built server
export { default, GET, POST, PUT, PATCH, DELETE, OPTIONS } from '../build/server/index.js';
