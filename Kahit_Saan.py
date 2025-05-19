from flask import Flask, request, render_template
import requests
import random

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    lat, lon = None, None
    restaurant_name = None
    restaurant_names = []

    if request.method == 'POST':
        lat = request.form.get('lat')
        lon = request.form.get('lon')

        if lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                delta = 0.01
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
                response = requests.get(url, params={'data': query}, timeout=10)
                data = response.json()

                stores = data.get('elements', [])
                restaurant_names = [
                    element['tags']['name']
                    for element in stores
                    if 'tags' in element and 'name' in element['tags']
                ]

                if restaurant_names:
                    restaurant_name = random.choice(restaurant_names)
            except Exception as e:
                print(f"Error fetching data: {e}")

    return render_template(
        "index.html",
        selected_store = restaurant_name,
        restaurant_names = restaurant_names,
        latitude = lat,
        longitude = lon
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
