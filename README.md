# Judotechnieken Quiz

Oefenwebapp voor judotechnieken van de Eerste Utrechtse Judo en Ju Jutsu School.

- **Data:** `judotechnieken.json` (technieken, counters, combinaties, woordenlijst)
- **Frontend:** React + Vite + TypeScript + Tailwind in `web/`
- **Python:** `models.py` valideert de JSON (uv)
- **Lokaal:** `cd web && npm install && npm run dev` → http://localhost:5174
- **Testen:** `cd web && npm test` — valideert elke quizvraag tegen `judotechnieken.json`
- **Deploy (web):** DigitalOcean App Platform via `.do/app.yaml`
- **Mobiel (iOS/Android):** Capacitor wrapt dezelfde `web/dist`-build. Zie
  [AGENT.md §14](AGENT.md) en [`store/RELEASE.md`](store/RELEASE.md).
  - Android testen: `cd web && npm run cap:android` (Android Studio + emulator)
  - iOS testen: `cd web && npm run cap:ios` (macOS + Xcode vereist)
