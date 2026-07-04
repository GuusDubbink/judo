import type { CapacitorConfig } from '@capacitor/cli'

// Native shell config for the Judotechnieken Quiz (iOS + Android).
// The apps reuse the exact same web build that DigitalOcean serves:
// `npm run build` -> `dist/`, which Capacitor bundles into each platform.
//
// NOTE: `appId` is the permanent store identifier — it CANNOT be changed once
// the app is published. `nl.judotechnieken.app` is brand-agnostic on purpose so
// the app can grow beyond the quiz. `appName` is only the on-device label and
// can be changed any time.
const config: CapacitorConfig = {
  appId: 'nl.judotechnieken.app',
  appName: 'Judo Quiz',
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
