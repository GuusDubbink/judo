# App icons & splash screens

Source art for the native iOS/Android icons and splash screens, generated with
[`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets).

## Files

| File         | Size        | Purpose                                        |
|--------------|-------------|------------------------------------------------|
| `icon.svg`   | 1024×1024   | Placeholder app-icon source (club blue + belt) |
| `splash.svg` | 2732×2732   | Placeholder splash source                      |

These SVGs are **starter placeholders** — replace them with final artwork before
store submission. Keep the same dimensions and keep the icon **opaque and
full-bleed** (no transparency), which the iOS App Store icon requires.

## Generating the platform assets

`@capacitor/assets` consumes **PNG** sources named `icon.png` (1024×1024) and
`splash.png` (2732×2732) in this folder. Export the SVGs above to PNG first
(any tool — e.g. `rsvg-convert -w 1024 -h 1024 icon.svg > icon.png`, Figma, or
an online converter), then from `web/`:

```bash
npm install -D @capacitor/assets   # first time only
npm run cap:assets                 # = npx capacitor-assets generate
```

This writes every required icon/splash size into `ios/` and `android/`. Re-run it
whenever the source art changes, then `npx cap sync`.

> Note: in a sandboxed CI/agent environment `@capacitor/assets` may fail to
> download its native `libvips` binary. Generate assets on a normal dev machine.
