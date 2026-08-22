 
interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL = 60 * 1000; // 60 seconds
const memoryCache = new Map<string, CacheEntry>();

function invalidateCacheForEndpoint(endpoint: string) {
  // Aggressive cache invalidation logic based on URL heurisitcs
  if (endpoint.includes('/sites/')) {
    const siteIdMatch = endpoint.match(/\/sites\/([a-zA-Z0-9-]+)/);
    if (siteIdMatch) {
      const siteId = siteIdMatch[1];
      for (const key of memoryCache.keys()) {
        if (key.includes(siteId)) {
          memoryCache.delete(key);
        }
      }
    } else {
      // Clear all sites lists
      for (const key of memoryCache.keys()) {
        if (key.includes('/sites')) {
          memoryCache.delete(key);
        }
      }
    }
  }
}

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

async function fetchWithAuth(endpoint: string, options: RequestInit): Promise<Response> {
  options.credentials = 'include';
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${getToken()}`
  };

  let res = await fetch(endpoint, options);

  if (res.status === 401) {
    // Attempt to refresh token using HttpOnly cookie
    try {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}'}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('token', data.accessToken);
        }
        
        // Retry the original request with the new token
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${data.accessToken}`
        };
        res = await fetch(endpoint, options);
      } else {
        // Refresh failed, force logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        throw new Error('Unauthorized');
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      throw new Error('Unauthorized');
    }
  }

  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.error || json.message || text);
    } catch (e: any) {
      if (e.message !== text) throw e;
      throw new Error(text);
    }
  }

  return res;
}

export const apiClient = {
  async get(endpoint: string) {
    const cached = memoryCache.get(endpoint);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`[Cache HIT] ${endpoint}`);
      return cached.data;
    }
    
    console.log(`[Cache MISS] ${endpoint}`);
    const res = await fetchWithAuth(endpoint, { method: 'GET' });
    const data = await res.json();
    
    memoryCache.set(endpoint, { data, timestamp: Date.now() });
    return data;
  },
  
  async post(endpoint: string, body: any) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetchWithAuth(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async patch(endpoint: string, body: any) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetchWithAuth(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async delete(endpoint: string) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetchWithAuth(endpoint, { method: 'DELETE' });
    return res.json();
  }
};
