from flask import Flask, request, render_template_string
import requests
import random

app = Flask(__name__)

HTML = """
<!doctype html>
<html lang="en">
<head>
  <title>Nearby Restaurants Finder</title>
  <style>
    body { 
    font-family: Arial, sans-serif; 
    background: #f8f9fa; 
    margin: 0; 
    padding: 0; }

    .container { 
    max-width: 500px; 
    margin: 40px auto; 
    background: #fff; 
    border-radius: 8px; 
    box-shadow: 0 2px 8px #0001; 
    padding: 32px; }

    h2 { 
    text-align: center; 
    color: #333; }

    label { 
    display: block; 
    margin-top: 16px; 
    color: #555; }

    input[type="text"] { 
    width: 100%; 
    padding: 8px; 
    margin-top: 4px; 
    border-radius: 4px; 
    border: 1px solid #ccc; }

    input[type="submit"], button { 
    margin-top: 16px; 
    padding: 10px 18px; 
    border: none; 
    border-radius: 4px; 
    background: #007bff; 
    color: #fff; 
    cursor: pointer; }

    button { 
    background: #28a745; 
    margin-left: 8px; }

    input[type="submit"]:hover, button:hover { 
    opacity: 0.9; }
    
    .loading-overlay {
      display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(255,255,255,0.8); z-index: 9999; align-items: center; justify-content: center;
      font-size: 2em; color: #007bff;
    }
    .restaurant-main { background: #e9f7ef; padding: 18px; border-radius: 6px; margin-bottom: 18px; text-align: center; }
    .restaurant-list { list-style: none; padding: 0; }
    .restaurant-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .restaurant-list li:last-child { border-bottom: none; }
    .no-results { color: #c00; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
<div class="loading-overlay" id="loadingOverlay">Loading...</div>
<div class="container">
  <h2>Find Nearby Restaurants</h2>
  <form method="post" id="locationForm" autocomplete="off" onsubmit="showLoading()">
    <label>Latitude:</label>
    <input type="text" name="lat" id="lat" required value="{{ latitude or '' }}">
    <label>Longitude:</label>
    <input type="text" name="lon" id="lon" required value="{{ longitude or '' }}">
    <input type="submit" value="Find">
    <button type="button" onclick="getLocation()">Use My Location</button>
  </form>
  <script>
    function getLocation() {
      if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(function(position) {
          document.getElementById('lat').value = position.coords.latitude;
          document.getElementById('lon').value = position.coords.longitude;
          document.getElementById('locationForm').submit();
        }, function(error) {
          hideLoading();
          alert('Unable to retrieve your location.');
        });
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    }
    function showLoading() {
      document.getElementById('loadingOverlay').style.display = 'flex';
    }
    function hideLoading() {
      document.getElementById('loadingOverlay').style.display = 'none';
    }
    // Hide loading overlay on page load
    window.onload = hideLoading;
  </script>
  {% if selected_store %}
    <div class="restaurant-main">
      <h3>Selected Restaurant</h3>
      <div style="font-size:1.3em;font-weight:bold;">{{ selected_store }}</div>
    </div>
    {% if restaurant_names|length > 1 %}
      <h4>Other Nearby Restaurants:</h4>
      <ul class="restaurant-list">
        {% for name in restaurant_names if name != selected_store %}
          <li>{{ name }}</li>
        {% endfor %}
      </ul>
    {% endif %}
  {% elif latitude and longitude %}
    <div class="no-results">No restaurants found nearby.</div>
  {% endif %}
</div>
</body>
</html>
"""

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
                delta = 0.02
                bbox = f"{lat - delta},{lon - delta},{lat + delta},{lon + delta}"

                query = f"""
                [out:json];
                node["amenity"~"restaurant|cafe|fast_food|bar|pub"]({bbox});
                out;
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

    return render_template_string(
        HTML,
        selected_store=restaurant_name,
        restaurant_names=restaurant_names,
        latitude=lat,
        longitude=lon
    )

if __name__ == '__main__':
    app.run(debug=True)