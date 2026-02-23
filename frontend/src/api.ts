import { SearchResult, SearchParams } from './types';

const API_BASE = '/api';

export async function searchRestaurants(params: SearchParams): Promise<SearchResult> {
  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Search failed');
  }

  return response.json();
}
