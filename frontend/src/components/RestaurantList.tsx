import { useState } from 'react';
import type { Restaurant } from '../types';
import RestaurantModal from './RestaurantModal';

interface RestaurantListProps {
  restaurants: Restaurant[];
  total: number;
}

export default function RestaurantList({ restaurants, total }: RestaurantListProps) {
  const [open, setOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCloseModal = () => {
    setSelectedRestaurant(null);
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  };

  return (
    <>
      <div className="restaurant-list">
        <button
          type="button"
          className={`restaurant-list__toggle ${open ? 'restaurant-list__toggle--open' : ''}`}
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="restaurant-list__toggle-left">
            <span className={`restaurant-list__chevron ${open ? 'restaurant-list__chevron--open' : ''}`}>›</span>
            <h3>Other Nearby Places</h3>
          </div>
          <span className="count">{total} found</span>
        </button>

        <div className={`restaurant-list__collapse ${open ? 'restaurant-list__collapse--open' : ''}`}>
          <ul className="restaurant-list__items">
            {restaurants.map((r, index) => (
              <li
                key={`${r.name}-${index}`}
                className="restaurant-list__item"
                style={{ '--i': index } as React.CSSProperties}
                onClick={() => handleRestaurantClick(r)}
              >
                <span className="restaurant-list__item-name">{r.name}</span>
                {r.distance !== null && (
                  <span className="restaurant-list__item-distance">
                    {formatDistance(r.distance)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <RestaurantModal restaurant={selectedRestaurant} onClose={handleCloseModal} />
    </>
  );
}
