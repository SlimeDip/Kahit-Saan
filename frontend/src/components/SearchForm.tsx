import { useState, type FormEvent } from 'react';

interface SearchFormProps {
  onSearch: (lat: number, lon: number, delta: number) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [delta, setDelta] = useState(1);
  const [locatingUser, setLocatingUser] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      onSearch(latNum, lonNum, delta);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLon(position.coords.longitude.toString());
        setLocatingUser(false);
      },
      () => {
        alert('Unable to retrieve your location.');
        setLocatingUser(false);
      }
    );
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="search-form__coords">
        <div className="search-form__group">
          <label htmlFor="lat">Latitude</label>
          <input
            type="text"
            id="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 14.5995"
            required
          />
        </div>
        <div className="search-form__group">
          <label htmlFor="lon">Longitude</label>
          <input
            type="text"
            id="lon"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="e.g. 120.9842"
            required
          />
        </div>
      </div>

      <div className="search-form__slider-group">
        <div className="slider-header">
          <label>Search Radius</label>
          <span className="slider-value">{delta} km</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={delta}
          onChange={(e) => setDelta(parseFloat(e.target.value))}
        />
      </div>

      <div className="search-form__actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !lat || !lon}
        >
          <span className="btn-icon"></span>
          {loading ? 'Searching...' : 'Find Restaurant'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={getLocation}
          disabled={locatingUser}
        >
          <span className="btn-icon"></span>
          {locatingUser ? 'Locating...' : 'Use My Location'}
        </button>
      </div>
    </form>
  );
}
