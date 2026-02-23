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
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`,
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
