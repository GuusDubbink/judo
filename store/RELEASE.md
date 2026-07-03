# Release guide — Judoquiz

How to produce signed store builds from the Capacitor project in `web/`.

All commands run from `web/`. Every release starts by baking the current web app
into the native projects:

```bash
npm run cap:sync        # = npm run build && cap sync
```

Bump the version first (see **Versioning** below).

---

## Versioning

Keep one source of truth in `web/package.json` `"version"` (e.g. `1.0.0`) and
mirror it into the native projects on each release:

- **iOS** — in Xcode target *App → General*: set **Version** (marketing, e.g.
  `1.0.0`) and increment **Build** (integer, must go up every upload).
- **Android** — in `android/app/build.gradle`: set `versionName "1.0.0"` and
  increment `versionCode` (integer, must go up every upload).

---

## Android (Google Play)

### One-time: create an upload keystore (keep it OUT of git)

```bash
keytool -genkey -v -keystore judoquiz-upload.keystore \
  -alias judoquiz -keyalg RSA -keysize 2048 -validity 10000
```

Store `judoquiz-upload.keystore` somewhere safe and back it up — losing it means
you can't ship updates. Then create `android/key.properties` (git-ignored):

```properties
storeFile=/absolute/path/to/judoquiz-upload.keystore
storePassword=…
keyAlias=judoquiz
keyPassword=…
```

Wire it into `android/app/build.gradle` (`signingConfigs` + `buildTypes.release`)
per the Capacitor Android signing docs:
https://capacitorjs.com/docs/android/deploying-to-google-play

### Build the release bundle (AAB)

```bash
npm run cap:sync
npx cap open android          # or build headless:
cd android && ./gradlew bundleRelease
# output: android/app/build/outputs/bundle/release/app-release.aab
```

Upload the `.aab` in the Play Console → create a release track (internal →
closed → production). Fill in the Data safety form: **no data collected**; note
the embedded YouTube player.

---

## iOS (App Store) — requires a Mac with Xcode

```bash
npm run cap:sync
npx cap open ios              # opens App.xcworkspace in Xcode
```

In Xcode:
1. *Signing & Capabilities* → select your Apple Developer **Team** (automatic
   signing is fine to start).
2. Set the bundle identifier to the final App ID (matches `capacitor.config.ts`).
3. Set Version + Build (see **Versioning**).
4. *Product → Archive* → *Distribute App → App Store Connect → Upload*.
5. In App Store Connect: complete the listing (see `listing-*.md`), attach
   screenshots, set the privacy policy URL, answer App Privacy = **no data
   collected**, and submit for review. Use TestFlight for beta testing first.

---

## Checklist before submitting

- [ ] Final `appId` confirmed in `capacitor.config.ts` (and both native projects).
- [ ] Version + build numbers bumped on both platforms.
- [ ] Final icon & splash generated (`web/resources/README.md`).
- [ ] `npm test && npm run typecheck && npm run build` all pass.
- [ ] Smoke-tested on a real device / simulator, including a YouTube technique video.
- [ ] Privacy policy hosted at a public URL and linked in both stores.
- [ ] Screenshots added to `store/screenshots/`.
