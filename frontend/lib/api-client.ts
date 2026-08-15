 
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

function handleAuthError(res: Response) {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    throw new Error('Unauthorized');
  }
}

export const apiClient = {
  async get(endpoint: string) {
    // 1. Check in-memory cache
    const cached = memoryCache.get(endpoint);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`[Cache HIT] ${endpoint}`);
      return cached.data;
    }
    
    console.log(`[Cache MISS] ${endpoint}`);

    // 2. Network request if cache is stale or missing
    const res = await fetch(endpoint, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!res.ok) {
      handleAuthError(res);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || json.message || text);
      } catch (e: any) {
        if (e.message !== text) throw e;
        throw new Error(text);
      }
    }
    const data = await res.json();
    
    // 3. Save to cache
    memoryCache.set(endpoint, { data, timestamp: Date.now() });
    
    return data;
  },
  
  async post(endpoint: string, body: any) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      handleAuthError(res);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || json.message || text);
      } catch (e: any) {
        if (e.message !== text) throw e;
        throw new Error(text);
      }
    }
    return res.json();
  },

  async patch(endpoint: string, body: any) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetch(endpoint, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      handleAuthError(res);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || json.message || text);
      } catch (e: any) {
        if (e.message !== text) throw e;
        throw new Error(text);
      }
    }
    return res.json();
  },

  async delete(endpoint: string) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetch(endpoint, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!res.ok) {
      handleAuthError(res);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || json.message || text);
      } catch (e: any) {
        if (e.message !== text) throw e;
        throw new Error(text);
      }
    }
    return res.json();
  }
};
