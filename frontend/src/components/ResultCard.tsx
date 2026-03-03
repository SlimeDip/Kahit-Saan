import { useState } from 'react';
import type { Restaurant } from '../types';

interface ResultCardProps {
  restaurant: Restaurant;
  onReroll: () => void;
  canReroll: boolean;
}

export default function ResultCard({ restaurant, onReroll, canReroll }: ResultCardProps) {
  const [spinning, setSpinning] = useState(false);

  const openInMaps = () => {
    if (restaurant.lat && restaurant.lon) {
      // Combine name + coordinates for best accuracy - shows specific branch with proper label
      const query = encodeURIComponent(`${restaurant.name} near ${restaurant.lat},${restaurant.lon}`);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        '_blank'
      );
    } else {
      alert('Location coordinates not available.');
    }
  };

  const handleReroll = () => {
    setSpinning(true);
    setTimeout(() => {
      onReroll();
      setSpinning(false);
    }, 400);
  };

  const amenityLabel = (amenity: string): string => {
    const labels: Record<string, string> = {
      restaurant: 'Restaurant',
      cafe: 'Cafe',
      fast_food: 'Fast Food',
      bar: 'Bar',
      pub: 'Pub',
    };
    return labels[amenity] || amenity;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  };

  return (
    <div className="result">
      <div className={`result__card ${spinning ? 'result__card--spinning' : ''}`}>
        <span className="result__label">Try eating at</span>
        <h2 className="result__name" key={restaurant.name}>{restaurant.name}</h2>

        <div className="result__meta">
          {restaurant.amenity && (
            <span className="result__tag">{amenityLabel(restaurant.amenity)}</span>
          )}
          {restaurant.cuisine && (
            <span className="result__tag">{restaurant.cuisine}</span>
          )}
          {restaurant.distance !== null && (
            <span className="result__tag result__tag--distance">
              📍 {formatDistance(restaurant.distance)} away
            </span>
          )}
        </div>

        <div className="result__details">
          {restaurant.address && (
            <div className="result__detail-row">
              <span className="result__detail-icon">📍</span>
              <span>{restaurant.address}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="result__detail-row">
              <span className="result__detail-icon">📞</span>
              <a href={`tel:${restaurant.phone}`} className="result__detail-link">{restaurant.phone}</a>
            </div>
          )}
          {restaurant.website && (
            <div className="result__detail-row">
              <span className="result__detail-icon">🌐</span>
              <a
                href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
                target="_blank"
                rel="noreferrer"
                className="result__detail-link"
              >
                {restaurant.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          )}
          {restaurant.opening_hours && (
            <div className="result__detail-row">
              <span className="result__detail-icon">🕐</span>
              <span>{restaurant.opening_hours}</span>
            </div>
          )}
        </div>

        <div className="result__buttons">
          {canReroll && (
            <button
              type="button"
              className="result__reroll-btn"
              onClick={handleReroll}
              disabled={spinning}
            >
              <span className={`result__reroll-icon ${spinning ? 'result__reroll-icon--spin' : ''}`}></span>
              Reroll
            </button>
          )}

          <button
            type="button"
            className="result__map-btn"
            onClick={openInMaps}
          >
            Find on Google Maps
          </button>
        </div>
      </div>

      <p className="result__note">
        Note: Data accuracy may be limited. Some information could be outdated.
      </p>
    </div>
  );
}
