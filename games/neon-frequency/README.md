# NEON FREQUENCY — The Lost Sound

A standalone, mobile-friendly branching music adventure for the retro app.

## Play locally
Open `index.html` in a browser. Story choices, inventory, reputation, energy, trust, allies, multiple endings, rewind, and local save/load are included.

## Offline support
When served from HTTPS or localhost, the included service worker caches the game shell. Open the game once online to cache it, then revisit it offline. Browsers do not enable service workers when opening a file directly with `file://`.

## Add to the retro app
Link to `games/neon-frequency/index.html` from the app's game menu. Keep `index.html` and `sw.js` in the same folder so the offline cache can register. No external libraries, fonts, or assets are required.

## Features
- Blue/red cybernetic 2000s styling
- Branching narrative with consequences and conditional routes
- Inventory, reputation, energy, trust, and crew state
- Multiple endings and replay
- Local save/load and rewind
- Responsive mobile layout and service-worker offline caching
