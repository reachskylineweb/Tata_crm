/**
 * CENTRALIZED API CONFIGURATION
 * -----------------------------------------------------------------------
 * Set VITE_API_URL in your frontend .env file for each environment:
 *
 *   Local dev   → Leave VITE_API_URL unset (Vite proxy handles /api → localhost:3000)
 *   Vercel      → VITE_API_URL=https://your-backend.railway.app/api
 *   OVHcloud    → VITE_API_URL=https://api.yourdomain.com/api
 *   DigitalOcean→ VITE_API_URL=https://api.yourdomain.com/api
 *
 * -----------------------------------------------------------------------
 */
const RAILWAY_URL = "https://tatacrm-production.up.railway.app/api";

// Fallback to Railway in production to prevent breaking existing Vercel deployments
// In local dev (import.meta.env.DEV), default to '/api' to use the vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : RAILWAY_URL);

// Create a safe URL for resolving static assets (images, uploads)
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export default API_BASE_URL;
