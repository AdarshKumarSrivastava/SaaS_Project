 
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    
    // 3. Save to cache
    memoryCache.set(endpoint, { data, timestamp: Date.now() });
    
    return data;
  },
  
  async post(endpoint: string, body: any) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(endpoint: string, body: any) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(endpoint: string) {
    invalidateCacheForEndpoint(endpoint);
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
