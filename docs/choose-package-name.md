# Choose package name (last step before builds)

The iOS **bundle identifier** and Android **package name** are permanent. Pick them once, immediately before creating store apps and running production `eas build`.

## When to do this

Complete first:

- [eas.json](../eas.json) and EAS project link (`eas init`)
- Privacy and support URLs live on `tapok.reggietheroman.app`
- In-app Privacy screen shipped
- Store listing copy and screenshots drafted

Then choose IDs, write them into [app.json](../app.json), create App Store Connect / Play Console apps, and build.

## How to choose

Use reverse-DNS style: lowercase, no spaces, e.g. `com.publisher.appname`.

- You do **not** need a matching domain, though `app.reggietheroman.tapok` mirrors the site at
  `tapok.reggietheroman.app`.
- The ID must be **unique** on Apple’s portal for your team.
- iOS and Android should use the **same string** when possible.

### Chosen package name

| Platform | Value |
|----------|-------|
| iOS `bundleIdentifier` | `app.reggietheroman.tapok` |
| Android `package` | `app.reggietheroman.tapok` |

This identifier is now configured in `app.json`. Use it exactly when creating both store apps.

## Apply to app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "app.reggietheroman.tapok"
    },
    "android": {
      "package": "app.reggietheroman.tapok"
    }
  }
}
```

Replace with your final choice. Commit before building.

## After locking IDs

1. Create App Store Connect app with that bundle ID.
2. Create Google Play app with that package name.
3. Set `ascAppId` in [eas.json](../eas.json) `submit.production.ios`.
4. Run quality gates, then:

```sh
eas build --platform all --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

See [store-release-console-checklist.md](store-release-console-checklist.md) and [app-store-release-runbook.md](app-store-release-runbook.md).
