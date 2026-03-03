from flask import Flask, request, jsonify, send_from_directory
import requests
import random
import math
import os

app = Flask(__name__)


def _haversine(lat1, lon1, lat2, lon2):
    """Return distance in metres between two lat/lon points."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _element_to_restaurant(el, user_lat=None, user_lon=None):
    lat, lon = None, None
    if 'lat' in el and 'lon' in el:
        lat, lon = el['lat'], el['lon']
    elif 'center' in el:
        lat, lon = el['center']['lat'], el['center']['lon']

    tags = el.get('tags', {})

    # Build address from OSM addr:* tags
    addr_parts = []
    if tags.get('addr:housenumber'):
        addr_parts.append(tags['addr:housenumber'])
    if tags.get('addr:street'):
        addr_parts.append(tags['addr:street'])
    if tags.get('addr:city'):
        addr_parts.append(tags['addr:city'])
    address = ', '.join(addr_parts) if addr_parts else ''

    distance = None
    if lat is not None and lon is not None and user_lat is not None and user_lon is not None:
        distance = round(_haversine(user_lat, user_lon, lat, lon))

    return {
        'name': tags.get('name', ''),
        'lat': lat,
        'lon': lon,
        'amenity': tags.get('amenity', ''),
        'cuisine': tags.get('cuisine', ''),
        'phone': tags.get('phone') or tags.get('contact:phone', ''),
        'website': tags.get('website') or tags.get('contact:website', ''),
        'opening_hours': tags.get('opening_hours', ''),
        'address': address,
        'distance': distance,
    }


@app.route('/api/search', methods=['POST'])
def search():
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    delta = data.get('delta', 1)

    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    try:
        lat, lon, delta = float(lat), float(lon), float(delta) * 0.01
        bbox = f"{lat - delta},{lon - delta},{lat + delta},{lon + delta}"

        query = f"""
        [out:json];
        (
        node["amenity"~"restaurant|cafe|fast_food|bar|pub"]({bbox});
        way["amenity"~"restaurant|cafe|fast_food|bar|pub"]({bbox});
        relation["amenity"~"restaurant|cafe|fast_food|bar|pub"]({bbox});
        );
        out center;
        """

        response = requests.get(
            "http://overpass-api.de/api/interpreter",
            params={'data': query}, timeout=15,
        )
        elements = response.json().get('elements', [])
        restaurants = [
            _element_to_restaurant(el, lat, lon) for el in elements
            if 'tags' in el and 'name' in el['tags']
        ]
        # Sort by distance (closest first), restaurants without coords last
        restaurants.sort(key=lambda r: r['distance'] if r['distance'] is not None else float('inf'))
        selected = random.choice(restaurants) if restaurants else None

        return jsonify({
            'selected': selected,
            'restaurants': restaurants,
            'total': len(restaurants),
        })

    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    dist_dir = os.path.join(app.root_path, 'frontend', 'dist')
    if path and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    return send_from_directory(dist_dir, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '10000'))
    app.run(host='0.0.0.0', port=port, debug=True)
