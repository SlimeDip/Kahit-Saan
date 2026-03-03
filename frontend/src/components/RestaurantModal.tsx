import { createPortal } from 'react-dom';
import type { Restaurant } from '../types';

interface RestaurantModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export default function RestaurantModal({ restaurant, onClose }: RestaurantModalProps) {
  if (!restaurant) return null;

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

  const getAmenityIcon = (amenity: string): string => {
    const icons: Record<string, string> = {
      restaurant: '🍽️',
      cafe: '☕',
      fast_food: '🍔',
      bar: '🍺',
      pub: '🍻',
      public_market: '🏪',
    };
    return icons[amenity] || '🍴';
  };

  const amenityLabel = (amenity: string): string => {
    const labels: Record<string, string> = {
      restaurant: 'Restaurant',
      cafe: 'Cafe',
      fast_food: 'Fast Food',
      bar: 'Bar',
      pub: 'Pub',
      public_market: 'Public Market',
    };
    return labels[amenity] || amenity;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-header">
          <h2 className="modal-title">{restaurant.name}</h2>
          <div className="modal-tags">
            {restaurant.amenity && (
              <span className="modal-tag">{amenityLabel(restaurant.amenity)}</span>
            )}
            {restaurant.cuisine && (
              <span className="modal-tag">{restaurant.cuisine}</span>
            )}
            {restaurant.distance !== null && (
              <span className="modal-tag modal-tag--distance">📍 {formatDistance(restaurant.distance)} away</span>
            )}
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3 className="modal-section-title">Location</h3>
            {restaurant.lat && restaurant.lon ? (
              <div className="modal-location">
                {restaurant.address && (
                  <p className="modal-address">📍 {restaurant.address}</p>
                )}
                {restaurant.distance !== null && (
                  <p className="modal-distance-info">
                    {formatDistance(restaurant.distance)} from your location
                  </p>
                )}
                <p className="modal-coordinates">
                  <span className="modal-coord-label">Coordinates:</span>
                  <br />
                  Latitude: {restaurant.lat.toFixed(6)}°
                  <br />
                  Longitude: {restaurant.lon.toFixed(6)}°
                </p>
                <div className="modal-visual-card">
                  <div className="modal-visual-icon">
                    {getAmenityIcon(restaurant.amenity)}
                  </div>
                  <div className="modal-visual-info">
                    <h4>{restaurant.name}</h4>
                    <p>{amenityLabel(restaurant.amenity)}{restaurant.cuisine && ` • ${restaurant.cuisine}`}</p>
                  </div>
                  
                </div>
              </div>
            ) : (
              <p className="modal-no-data">Location not available</p>
            )}
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">About This Place</h3>
            <div className="modal-description">
              {restaurant.amenity && (
                <div className="modal-description-item">
                  <span>Type: <strong>{amenityLabel(restaurant.amenity)}</strong></span>
                </div>
              )}
              {restaurant.cuisine && (
                <div className="modal-description-item">
                  <span>Cuisine: <strong>{restaurant.cuisine.charAt(0).toUpperCase() + restaurant.cuisine.slice(1)}</strong></span>
                </div>
              )}
              <div className="modal-description-item">
                <span>Perfect for dining out, grabbing a quick bite, or meeting friends</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn modal-btn-primary"
            onClick={openInMaps}
          >
            Open in Google Maps
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
