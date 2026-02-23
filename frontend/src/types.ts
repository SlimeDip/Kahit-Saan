export interface Restaurant {
  name: string;
  lat: number | null;
  lon: number | null;
  amenity: string;
  cuisine: string;
}

export interface SearchResult {
  selected: Restaurant | null;
  restaurants: Restaurant[];
  total: number;
}

export interface SearchParams {
  lat: number;
  lon: number;
  delta: number;
}
