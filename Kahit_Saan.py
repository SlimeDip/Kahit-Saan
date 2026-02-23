from flask import Flask, request, jsonify, send_from_directory
import requests
import random
import os

app = Flask(__name__)

@app.route('/api/search', methods=['POST'])
def search():
    """API endpoint for searching nearby restaurants."""
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    delta = data.get('delta', 1)

    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    try:
        lat = float(lat)
        lon = float(lon)
        delta = float(delta) * 0.01
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

        url = "http://overpass-api.de/api/interpreter"
        response = requests.get(url, params={'data': query}, timeout=15)
        api_data = response.json()

        stores = api_data.get('elements', [])
        named_stores = [
            el for el in stores
            if 'tags' in el and 'name' in el['tags']
        ]

        selected = None
        if named_stores:
            selected_element = random.choice(named_stores)
            slat, slon = None, None
            if 'lat' in selected_element and 'lon' in selected_element:
                slat = selected_element['lat']
                slon = selected_element['lon']
            elif 'center' in selected_element:
                slat = selected_element['center']['lat']
                slon = selected_element['center']['lon']

            selected = {
                'name': selected_element['tags']['name'],
                'lat': slat,
                'lon': slon,
                'amenity': selected_element['tags'].get('amenity', ''),
                'cuisine': selected_element['tags'].get('cuisine', ''),
            }

        # Build full restaurant objects for client-side reroll
        all_restaurants = []
        for el in named_stores:
            r_lat, r_lon = None, None
            if 'lat' in el and 'lon' in el:
                r_lat = el['lat']
                r_lon = el['lon']
            elif 'center' in el:
                r_lat = el['center']['lat']
                r_lon = el['center']['lon']
            all_restaurants.append({
                'name': el['tags']['name'],
                'lat': r_lat,
                'lon': r_lon,
                'amenity': el['tags'].get('amenity', ''),
                'cuisine': el['tags'].get('cuisine', ''),
            })

        return jsonify({
            'selected': selected,
            'restaurants': all_restaurants,
            'total': len(all_restaurants),
        })

    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve the React frontend."""
    dist_dir = os.path.join(app.root_path, 'frontend', 'dist')
    if path and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    return send_from_directory(dist_dir, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '10000'))
    app.run(host='0.0.0.0', port=port, debug=True)
