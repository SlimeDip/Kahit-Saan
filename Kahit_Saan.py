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
        delta = request.form.get('delta', '0.1')

        if lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                delta = float(delta) * 0.01
                bbox = f"{lat - delta},{lon - delta},{lat + delta},{lon + delta}"
                print(f"delta = {delta}")

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
                    selected_element = random.choice([
                        element for element in stores
                        if 'tags' in element and 'name' in element['tags']
                    ])
                    restaurant_name = selected_element['tags']['name']
                    
                    if 'lat' in selected_element and 'lon' in selected_element:
                        slat = selected_element['lat']
                        slon = selected_element['lon']
                    elif 'center' in selected_element:
                        slat = selected_element['center']['lat']
                        slon = selected_element['center']['lon']

            except Exception as e:
                print(f"Error fetching data: {e}")

    return render_template(
        "index.html",
        selected_store = restaurant_name,
        restaurant_names = restaurant_names,
        latitude = lat,
        longitude = lon,
        selected_latitude = slat if 'slat' in locals() else None,
        selected_longitude = slon if 'slon' in locals() else None
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
    # app.run(debug=True)