# ParkVision - MERN Stack Frontend

A vehicle ANPR and parking optimizer system built with React.

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Plain CSS

## Getting Started

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

The app will run on `http://localhost:3000`

### Build

\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/       # Reusable components
│   ├── Sidebar.jsx
│   ├── StatusBadge.jsx
│   └── ProgressBar.jsx
├── pages/           # Page components
│   ├── Dashboard.jsx
│   ├── Vehicles.jsx
│   ├── Zones.jsx
│   └── Logs.jsx
├── styles/          # CSS files
│   ├── global.css
│   ├── layout.css
│   ├── components.css
│   ├── sidebar.css
│   └── pages.css
├── App.jsx          # Main app with routing
└── main.jsx         # Entry point
\`\`\`

## Backend Integration

The app is configured to proxy API requests to `http://localhost:5000`. 

Replace mock data in pages with actual API calls:

\`\`\`javascript
// Example API call
fetch('/api/zones')
  .then(res => res.json())
  .then(data => setZones(data))
\`\`\`

## Features

- Dashboard with real-time parking zone overview
- Live vehicle feed with ANPR data
- Pollution meter with fuel type distribution
- Vehicle management with filters
- Parking zone CRUD operations
- Logs and reports with CSV export
- Responsive design
