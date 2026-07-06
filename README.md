# Judotechnieken Quiz

Oefenwebapp voor judotechnieken van de Eerste Utrechtse Judo en Ju Jutsu School.

- **Data:** `data/judotechnieken.json` (technieken, counters, combinaties, woordenlijst)
- **Kodokan-koppelingen:** `data/kodokan_mappings.json` (expliciet, getest)
- **Frontend:** React + Vite + TypeScript + Tailwind in `web/`
- **Python:** `data/models.py` valideert de JSON; `uv run pytest` test koppelingen
- **Lokaal:** `cd web && npm install && npm run dev` → http://localhost:5174
- **Testen:** `cd web && npm test` — valideert elke quizvraag tegen `data/judotechnieken.json`
- **Deploy (web):** DigitalOcean App Platform via `.do/app.yaml`
- **Mobiel (iOS/Android):** Capacitor wrapt dezelfde `web/dist`-build. Zie
  [AGENT.md §14](AGENT.md) en [`store/RELEASE.md`](store/RELEASE.md).
  - Android testen: `cd web && npm run cap:android` (Android Studio + emulator)
  - iOS testen: `cd web && npm run cap:ios` (macOS + Xcode vereist)
