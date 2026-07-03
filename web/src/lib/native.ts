// Native-shell integration for the Capacitor iOS/Android builds.
//
// Everything here is a no-op on the web (DigitalOcean) build: each entry point
// is guarded by `Capacitor.isNativePlatform()`, so importing this module and
// calling its functions is safe in the browser and in Vitest.
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

const CLUB_BLUE = '#00aeef'

/**
 * One-time native chrome setup: colour the status bar to match the club theme
 * and hide the splash screen once the web app has mounted. Call once at startup.
 */
export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    // Light content (icons/text) reads well on the blue status bar.
    await StatusBar.setStyle({ style: Style.Light })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: CLUB_BLUE })
    }
  } catch {
    // Status bar plugin is best-effort; never block app startup on it.
  }

  await SplashScreen.hide()
}

/** Close the app (Android only — used when back is pressed on the home screen). */
export async function exitNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await CapacitorApp.exitApp()
}

/**
 * Wire the Android hardware back button onto the quiz's own navigation so it
 * behaves like an in-app "back" instead of instantly closing the app.
 *
 * iOS has no hardware back button, so this listener simply never fires there.
 */
export function useAndroidBackButton(handler: () => void): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      handler()
    })

    return () => {
      void listenerPromise.then((listener) => listener.remove())
    }
  }, [handler])
}
