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

Run the test suite, linter, and privacy gate with:

```bash
npm test
npm run lint
npm run privacy-check
```

## Privacy and data handling

Kita-Kita is designed for local-first attendance workflows. Meeting and attendee records are stored on the device; there is no cloud sync service in this project. App state is encrypted before it is written to local storage, while encryption keys are kept in the platform secure store.

Only collect attendee information needed for attendance operations. Review the [privacy notice template](docs/privacy-notice-template.md), [PIA template](docs/privacy-impact-assessment-template.md), and [DPA compliance plan](docs/dpa-compliance-plan.md) before deploying the app for real events.

## Project documentation

- [Privacy documentation](docs/README.md)
- [Expo documentation](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
