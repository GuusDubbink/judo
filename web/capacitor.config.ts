import type { CapacitorConfig } from '@capacitor/cli'

// Native shell config for the Judotechnieken Quiz (iOS + Android).
// The apps reuse the exact same web build that DigitalOcean serves:
// `npm run build` -> `dist/`, which Capacitor bundles into each platform.
//
// NOTE: `appId` is the permanent store identifier. `nl.eujjjs.judoquiz` is a
// placeholder tied to the school (EUJJJS) — confirm/replace before the FIRST
// store submission, because it cannot be changed for an existing listing.
const config: CapacitorConfig = {
  appId: 'nl.eujjjs.judoquiz',
  appName: 'Judoquiz',
  webDir: 'dist',
  // No `server.url` here on purpose: production builds must bundle the local
  // `dist`. For live reload during development, pass it on the CLI instead:
  //   npx cap run android --livereload --external
  //   npx cap run ios --livereload --external
  plugins: {
    SplashScreen: {
      // Hidden manually from main.tsx once React has mounted, so users never
      // see a flash of empty webview.
      launchAutoHide: false,
      backgroundColor: '#00aeef', // club blue
      showSpinner: false,
    },
  },
}

export default config
