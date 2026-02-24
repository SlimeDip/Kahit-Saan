from flask import Flask, request, jsonify, send_from_directory
import requests
import random
import os

app = Flask(__name__)


def _element_to_restaurant(el):
    lat, lon = None, None
    if 'lat' in el and 'lon' in el:
        lat, lon = el['lat'], el['lon']
    elif 'center' in el:
        lat, lon = el['center']['lat'], el['center']['lon']
    return {
        'name': el['tags']['name'],
        'lat': lat,
        'lon': lon,
        'amenity': el['tags'].get('amenity', ''),
        'cuisine': el['tags'].get('cuisine', ''),
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
            _element_to_restaurant(el) for el in elements
            if 'tags' in el and 'name' in el['tags']
        ]
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
