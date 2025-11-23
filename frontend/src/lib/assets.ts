// frontend/src/lib/assets.ts

/**
 * Converts a database path to a full URL for assets (images/documents)
 * @param path - The path stored in the database (e.g., "/uploads/images/image-123.png")
 * @returns Full URL to the asset
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  
  // Get API URL from environment
  const apiUrl = import.meta.env.VITE_API_URL ;
  
  // Remove '/api' from the end to get base URL
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Checks if a URL is a full URL (starts with http/https)
 */
export function isFullUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}