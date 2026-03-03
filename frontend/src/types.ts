export interface Restaurant {
  name: string;
  lat: number | null;
  lon: number | null;
  amenity: string;
  cuisine: string;
  phone: string;
  website: string;
  opening_hours: string;
  address: string;
  distance: number | null;
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
