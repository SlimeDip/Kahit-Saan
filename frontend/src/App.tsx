import { useState, useCallback } from 'react';
import { Restaurant, SearchResult } from './types';
import { searchRestaurants } from './api';
import SearchForm from './components/SearchForm';
import ResultCard from './components/ResultCard';
import RestaurantList from './components/RestaurantList';
import LoadingOverlay from './components/LoadingOverlay';

export default function App() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (lat: number, lon: number, delta: number) => {
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const data = await searchRestaurants({ lat, lon, delta });
      setResult(data);
      setSelected(data.selected);
    } catch (err) {
      console.error('Search error:', err);
      setResult(null);
      setSelected(null);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReroll = useCallback(() => {
    if (!result || result.restaurants.length === 0) return;
    const candidates = result.restaurants.filter(
      (r) => r.name !== selected?.name
    );
    const pool = candidates.length > 0 ? candidates : result.restaurants;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setSelected(next);
  }, [result, selected]);

  const otherRestaurants = result?.restaurants.filter(
    (r) => r.name !== selected?.name
  ) ?? [];

  return (
    <div className="app">
      {loading && <LoadingOverlay />}

      <header className="header">
        <h1 className="header__title">Kahit Saan</h1>
        <p className="header__subtitle">
          Pre, saan mo gusto kumain? — <em>Kahit Saan!</em>
        </p>
      </header>

      <div className="card">
        <SearchForm onSearch={handleSearch} loading={loading} />
      </div>

      {selected && (
        <>
          <ResultCard
            restaurant={selected}
            onReroll={handleReroll}
            canReroll={result !== null && result.restaurants.length > 1}
          />
          {otherRestaurants.length > 0 && (
            <div className="card">
              <RestaurantList
                restaurants={otherRestaurants}
                total={result!.total}
              />
            </div>
          )}
        </>
      )}

      {error && !loading && (
        <div className="card">
          <div className="fetch-error">
            <div className="fetch-error__icon">⚠️</div>
            <p className="fetch-error__title">Failed to fetch results</p>
            <p className="fetch-error__title">Please try again.</p>
            <p className="fetch-error__text">{error}</p>
          </div>
        </div>
      )}

      {searched && !loading && !selected && !error && (
        <div className="card">
          <div className="no-results">
            <div className="no-results__icon">🍽️</div>
            <p className="no-results__text">
              No restaurants found nearby. Try increasing the search radius.
            </p>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>
          Powered by{' '}
          <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer">
            OpenStreetMap
          </a>{' '}
          &amp; Overpass API
        </p>
      </footer>
    </div>
  );
}
