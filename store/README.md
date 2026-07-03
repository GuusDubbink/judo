# Store release assets

Everything needed to publish **Judoquiz** to the App Store and Google Play that
isn't source code.

| File                | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| `RELEASE.md`        | Step-by-step build, signing & upload guide for both stores      |
| `privacy-policy.md` | Privacy policy (host this text at a public URL; both stores require one) |
| `listing-nl.md`     | Dutch store listing copy (name, subtitle, description, keywords) |
| `listing-en.md`     | English store listing copy                                       |
| `screenshots/`      | Store screenshots (add PNGs captured from simulator/emulator)   |

## Prerequisites (accounts — not in this repo)

- **Apple Developer Program** — $99/yr. Required to sign, run on device,
  use TestFlight, and submit to the App Store.
- **Google Play Console** — $25 one-time. Required to publish on Play.

See `RELEASE.md` for what to do once the accounts exist.
