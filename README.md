# Kahit Saan

Pre, saan mo gusto kumain?  
**Kahit Saan!**

---

Kahit Saan is a web app that helps you find nearby restaurants, cafes, fast food, bars, and pubs based on your location. Can't decide where to eat? Let Kahit Saan pick for you!

### View web app here: https://kahit-saan.onrender.com/

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, Flask |
| Frontend | React 18, TypeScript, Vite |
| Styling | Sass (SCSS) |
| Data Source | OpenStreetMap / Overpass API |
| Hosting | Render |

## Features

- Automatically detect your location or enter latitude/longitude manually
- Adjustable search radius slider
- Random restaurant selection with **Reroll** button (client-side, no extra API call)
- Collapsible list of other nearby restaurants
- Quick link to open the selected place on Google Maps
- Dark glassmorphism UI with animations
- Responsive / mobile-friendly

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/Kahit-Saan.git
cd Kahit-Saan

# Set up Python environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Build the frontend
cd frontend
npm install
npm run build
cd ..

# Run the app
python Kahit_Saan.py
```

Open http://localhost:10000 in your browser.

### Development

For frontend hot-reload during development:

```bash
# Terminal 1 — Flask API
python Kahit_Saan.py

# Terminal 2 — Vite dev server
cd frontend
npm run dev
```

Vite dev server proxies `/api` requests to Flask automatically.

## Usage

1. Enter your latitude and longitude, or click **Use My Location**.
2. Adjust the search radius slider.
3. Click **Find Restaurant** to get a random nearby restaurant.
4. Hit **Reroll** to pick a different one without searching again.
5. Expand **Other Nearby Places** to see the full list.
6. Click **Find on Google Maps** to navigate.

## Project Structure

```
Kahit-Saan/
├── Kahit_Saan.py          # Flask backend (API + serves built frontend)
├── requirements.txt       # Python dependencies
├── render.yaml            # Render deploy config
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── main.tsx       # Entry point
│   │   ├── App.tsx        # Root component
│   │   ├── api.ts         # API client
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── components/    # React components
│   │   └── styles/        # SCSS files
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```
