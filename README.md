# Kita-Kita

Kita-Kita is a local-first Expo app for managing meetings and recording attendance. It lets event organizers maintain attendee lists, issue encrypted attendee QR codes, scan check-ins, and transfer meeting data between devices through QR codes.

## Features

- Create, edit, search, and delete meetings.
- Add and edit attendees, or import attendee records from CSV.
- Generate attendee QR codes and scan them to record attendance.
- View attendance totals and clear check-ins when an event is reused.
- Copy a meeting to another device or synchronize attendance using multi-frame QR transfers.
- Store meeting data locally with encrypted application storage and keys held in `expo-secure-store`.

## Development

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Open the app with one of the following:

```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

The app uses Expo Router file-based routing. Application routes live in `src/app`, reusable UI components live in `src/components`, and domain logic lives in `src/lib`.

## Quality checks

Run the unit test suite, E2E tests, linter, and privacy gate with:

```bash
npm test
npm run test:e2e
npm run lint
npm run privacy-check
```

### E2E setup and troubleshooting

`@playwright/test` is the test runner; Chromium is a separate browser runtime. The E2E scripts provision Chromium automatically in a project-local Playwright directory, so they do not depend on a browser cache from another terminal, agent, or CI environment.

From a clean checkout:

```bash
npm ci
npm run test:e2e
```

The first E2E run downloads Chromium. To provision it separately:

```bash
npm run test:e2e:install
```

For interactive or headed debugging:

```bash
npm run test:e2e:ui
npm run test:e2e:headed
```

If all E2E tests fail immediately with `browserType.launch` or `Executable doesn't exist`, rerun `npm run test:e2e:install`. If the error mentions the Expo server or port 8081, check whether another process is using that port and run `npm run web` to verify Expo Web starts.

## Privacy and data handling

Kita-Kita is designed for local-first attendance workflows. Meeting and attendee records are stored on the device; there is no cloud sync service in this project. App state is encrypted before it is written to local storage, while encryption keys are kept in the platform secure store.

Only collect attendee information needed for attendance operations. Review the [privacy notice template](docs/privacy-notice-template.md), [PIA template](docs/privacy-impact-assessment-template.md), and [DPA compliance plan](docs/dpa-compliance-plan.md) before deploying the app for real events.

## Project documentation

- [Privacy documentation](docs/README.md)
- [App flow diagrams](docs/app-flows.md)
- [Expo documentation](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
