# Store release console checklist

Use this checklist while preparing Kita-Kita for App Store and Google Play. Complete the **Before package name** section first. Choose the bundle ID / package name last (see [choose-package-name.md](choose-package-name.md)), then finish the **After package name** section.

## Before package name

### Expo / EAS

- [ ] Install EAS CLI: `npm install --global eas-cli`
- [ ] Log in: `eas login` and verify with `eas whoami`
- [ ] Link this repo to an Expo project: `eas init` (adds `extra.eas.projectId` to `app.json`)
- [ ] Confirm [eas.json](../eas.json) is committed with `production` and `preview` profiles

### Cloudflare (privacy + support URLs)

- [ ] Confirm `reggietheroman.app` is an active zone on the Cloudflare account
- [ ] Deploy the pages in `www/`: `npm run site:deploy`
- [ ] After deploy, verify:
  - [ ] https://tapok.reggietheroman.app/privacy-policy
  - [ ] https://tapok.reggietheroman.app/support
  - [ ] https://tapok.reggietheroman.app/terms
- [ ] Use the privacy URL in both store consoles

### Listing assets (draft without final package)

- [ ] App display name: **Tapok** (Kita-Kita is the internal project name only)
- [ ] Short and full description (local-first attendance, QR check-in, no cloud sync)
- [ ] Screenshots: phone required; tablet if you declare tablet support
- [ ] Support email: support@reggietheroman.app
- [ ] Age / content rating questionnaire answers prepared
- [ ] App Privacy (Apple) and Data safety (Google) answers drafted — data stored on device, encrypted, not sold, not used for tracking

### Google Play (prep only)

- [ ] Create a Google Cloud service account for Play Console API access
- [ ] In Play Console → **Users and permissions**, invite the service account with release permissions
- [ ] Upload the service account JSON to EAS: `eas credentials --platform android` — **never commit the JSON file**

### Apple (prep only)

- [ ] Confirm Apple Developer Program membership is active
- [ ] Prepare review contact info and demo notes (no login required; synthetic attendee data)

## After package name

Do not start this section until you have chosen and written `ios.bundleIdentifier` and `android.package` into [app.json](../app.json). See [choose-package-name.md](choose-package-name.md).

### Apple App Store Connect

- [ ] Create app with the **exact** bundle identifier from `app.json`
- [ ] Record the App Store Connect **Apple ID** (`ascAppId`) and set it in [eas.json](../eas.json) submit profile
- [ ] Complete App Information, pricing, privacy nutrition labels, encryption questionnaire
- [ ] Upload screenshots and attach a production build after `eas build`
- [ ] Submit for review

### Google Play Console

- [ ] Create app with the **exact** package name from `app.json`
- [ ] Complete store listing, content rating, target audience, Data safety form
- [ ] Set privacy policy URL to the GitHub Pages link
- [ ] First `eas submit` usually lands on **internal testing**; promote after verification

### EAS credentials

- [ ] iOS: `eas credentials --platform ios` — distribution cert and provisioning profile
- [ ] Android: signing key managed by EAS or uploaded per org policy
- [ ] Test one manual `eas submit` per platform before enabling `--auto-submit`

## Related docs

- [App-store release runbook](app-store-release-runbook.md)
- [Choose package name (last step)](choose-package-name.md)
