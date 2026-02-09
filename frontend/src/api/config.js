// Use relative path by default to work seamlessly on the same domain (like Vercel rewrites)
// Or use environment variable if specifically configured
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
