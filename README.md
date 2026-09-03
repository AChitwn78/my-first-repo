# Ridewise

An interactive, mobile-friendly cycling route-planning prototype. It ranks sample routes using deterministic distance, elevation, and wind-direction scoring.

## Run it

Serve this directory over HTTPS (or locally) and open it in Safari. To install on an iPhone, tap **Share → Add to Home Screen**. It runs fullscreen and remains available offline after the first load. No API keys are required for the demo.

## What is included

- Ride-distance, departure-time, ride-type, and wind-preference controls
- Transparent mock weather forecast and route-scoring logic
- Responsive route recommendations and application menu
- Installable iPhone web app configuration and offline cache

## Next integration milestones

1. Add Strava OAuth and import cycling activities.
2. Persist canonical routes and decoded GPS tracks in a database.
3. Replace mock weather with an hourly forecast provider.
4. Score every route segment against the forecast as it is reached.
