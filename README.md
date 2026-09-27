# AegisAI Complete Frontend

## Stack
- React 18
- Vite
- Recharts
- Lucide React
- Plain CSS

## Run in VS Code

1. Extract this folder.
2. Open the folder in VS Code.
3. Open Terminal.
4. Run:

npm install
npm run dev

5. Open the localhost URL printed by Vite.

## Current frontend features

- Dashboard matching the AegisAI aerospace concept
- Responsive sidebar/navigation
- Engine Health Index
- Engine status and risk
- Live telemetry simulation
- Digital Twin visualization
- Expected vs live values
- AI prediction/confidence
- Explainable alert
- Health trend charts
- Mission profile
- Mission replay slider
- Reports page
- Settings page
- Controlled simulated fault demonstration
- Mobile responsive layout

## Backend connection

The frontend currently generates demo telemetry locally so it can run immediately.

Later, replace the telemetry simulation in `src/App.jsx` with REST/WebSocket calls to your FastAPI backend.

Recommended production flow:

ESP32/DAQ → FastAPI → AI/ML → Digital Twin → WebSocket → React Dashboard

Important: demo values and simulated fault behaviour are not real UAV/DRDO engine measurements.
