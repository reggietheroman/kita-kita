# Kita-Kita app-store release runbook

This runbook describes how to publish Kita-Kita to the Apple App Store and
Google Play, then repeat the process for future releases.

Kita-Kita is an Expo SDK 57 app. The recommended release path is
[EAS Build](https://docs.expo.dev/build/introduction/) plus
[EAS Submit](https://docs.expo.dev/deploy/submit-to-app-stores/).

## Important distinction

- A **store release** creates a signed iOS `.ipa` and/or Android `.aab`, uploads
  it to the store, and goes through store review.
- An **OTA update** can only update JavaScript, styling, and bundled assets for
  compatible installed binaries. This repository does not currently include
  `expo-updates`, so use a new store release for every release unless OTA
  updates are deliberately configured and tested later.
- Changes to native code, native dependencies, permissions, the Expo SDK, or
  the runtime require a new store binary.

## One-time setup

### 1. Create the required accounts

You need:

- An [Expo account](https://expo.dev/signup).
- A paid [Apple Developer Program](https://developer.apple.com/programs)
  membership for iOS distribution.
- A [Google Play Developer](https://play.google.com/console/signup) account
  for Android distribution.

Keep store credentials, API keys, service-account JSON files, keystores, and
Apple signing files out of Git. Store them in the relevant provider's secure
credential manager or EAS credentials. Never paste credentials into this
runbook or commit them.

### 2. Reserve permanent app identifiers

Choose identifiers once; changing them later creates a different store app.
Add them to `app.json` under `expo`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.kitakita"
    },
    "android": {
      "package": "com.example.kitakita"
    }
  }
}
```

Replace both example values with identifiers owned by the Kita-Kita
organization. The Android package and iOS bundle identifier must remain stable
for all future releases.

Before the first production build, also confirm:

- The display name, icon, splash screen, camera permission text, and supported
  orientation are correct in `app.json`.
- The privacy notice is ready and linked from the store listings.
- Store screenshots, descriptions, age/content ratings, support URL, and
  contact information are ready.
- The App Store privacy details and Google Play Data safety answers accurately
  describe the app's attendee data handling. Do not claim that attendee
  personal data is not collected or stored if the app stores it locally.

### 3. Install and authenticate EAS CLI

From the repository root:

```sh
npm install --global eas-cli
eas login
eas whoami
eas build:configure
```

Review the generated `eas.json` before building. Keep the `production` build
profile for store binaries. Commit configuration changes, but never commit
secrets.

### 4. Create the store apps and credentials

#### Apple App Store

1. Create the app in [App Store Connect](https://appstoreconnect.apple.com/)
   using the same bundle identifier.
2. Complete the App Information, pricing/availability, privacy details,
   ratings, screenshots, description, support URL, and review information.
3. Run `eas credentials --platform ios` and let EAS create/manage the
   distribution credentials, or provide credentials managed by the
   organization.
4. Record the App Store Connect **Apple ID** (`ascAppId`) for the app.

#### Google Play

1. Create the app in [Google Play Console](https://play.google.com/console/)
   using the same Android package name.
2. Complete the store listing, app content, target audience, content rating,
   Data safety form, privacy policy URL, screenshots, and testing/release
   setup.
3. Create a Google service account with the minimum Play Console permissions
   needed for submissions. Upload its key to the Kita-Kita project's EAS
   credentials using `eas credentials --platform android`.
4. Do not store the downloaded service-account JSON in the repository.

## First production publication

### 1. Prepare and verify the release

From a clean checkout:

```sh
npm ci
npm run lint
npm test -- --runInBand
npm run privacy-check
```

Test the release candidate on representative iOS and Android devices. At
minimum, verify meeting creation, attendee add/edit/delete, CSV import/export,
QR scanning, check-in, device transfer, and the privacy notice. Confirm that
test data is synthetic or consented data and is removed after testing.

### 2. Build signed store binaries

Build both platforms together, or build one platform at a time:

```sh
eas build --platform all --profile production
# or:
eas build --platform ios --profile production
eas build --platform android --profile production
```

EAS will prompt for signing credentials if they are not configured. Wait for
both builds to finish and inspect the build links and logs. Android production
must be an `.aab`; an APK is for direct installation/testing and is not the
normal Google Play submission artifact.

### 3. Upload to the stores

Submit each completed build:

```sh
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

For iOS, EAS uploads the build to App Store Connect. After processing, select
the build in the correct App Store version and submit it for Apple review.
For Android, the first EAS submission normally lands on the internal testing
track. Finish the Play Console release and promote it to production only
after the listing and required declarations are complete.

You can combine the build and upload for later use:

```sh
eas build --platform all --profile production --auto-submit
```

Do not use `--auto-submit` until the submission profiles and credentials have
been tested successfully.

### 4. Complete review and staged rollout

- Monitor Apple review status in App Store Connect and Google review/release
  status in Play Console.
- Start with internal testing or a staged rollout when practical.
- Record the released version, build numbers, release notes, review outcome,
  and any rollback decision.
- If a store rejects the app, address the specific review feedback, create a
  new build if the binary must change, and resubmit.

## Releasing a new store version

Use this checklist for every production release.

### Before building

1. Merge and check out the exact commit to release.
2. Update `expo.version` in `app.json` to the next user-facing version, such
   as `1.0.0` → `1.0.1` or `1.1.0`.
3. Ensure the developer-facing build numbers will be unique:
   - Android `versionCode`
   - iOS `buildNumber`
4. Prefer EAS remote version management in `eas.json`:

   ```json
   {
     "cli": {
       "appVersionSource": "remote"
     },
     "build": {
       "production": {
         "autoIncrement": true
       }
     }
   }
   ```

   If this app has already shipped with manually managed build numbers, sync
   the current store values first with `eas build:version:set`, then enable
   remote auto-increment. Never reuse an iOS build number or Android version
   code already uploaded to a store.
5. Update release notes and any changed screenshots or store declarations.
6. Run the verification commands and device tests from the first-publication
   section.

### Build and submit

```sh
eas build --platform all --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

If only one platform changed, build and submit that platform. If the change
touches native configuration, permissions, or dependencies, release a new
binary for every affected platform.

### After submission

1. Confirm the build is attached to the intended App Store version and Google
   Play release.
2. Start review or staged rollout in each store.
3. Verify the production app after rollout on both platforms.
4. Update the release log or changelog in the repository.
5. Keep the previous production binary available as the rollback reference.

## Optional: JavaScript-only OTA release

Do not use this section until `expo-updates` and EAS Update have been
configured, a compatible production channel has been established, and the
rollback procedure has been tested.

For a compatible JavaScript, styling, or asset-only change:

```sh
eas update --channel production --message "Describe the fix"
```

An OTA update does not replace a store submission when native code,
permissions, native dependencies, or the Expo SDK changes. Follow the store
release procedure in those cases.

## Useful commands

```sh
eas build:list
eas submit:list
eas credentials
eas project:info
```

If a build or submission fails, use the linked EAS logs first. Do not retry
with copied credentials or commit generated credential files.

## Official references

- [Create your first EAS build](https://docs.expo.dev/build/setup/)
- [Submit to Apple App Store](https://docs.expo.dev/submit/ios/)
- [Submit to Google Play Store](https://docs.expo.dev/submit/android/)
- [App version management](https://docs.expo.dev/build-reference/app-versions/)
- [App stores best practices](https://docs.expo.dev/distribution/app-stores/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
