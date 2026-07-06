# Installation

## Prerequisites

- Node.js 24 or newer
- npm 11 or newer
- Microsoft Edge installed locally for the current Playwright browser profile on Windows

## Install Dependencies

```bash
npm install
```

## Start Local Development

```bash
npm run dev
```

Default local URL:

- `http://localhost:5173/`

## Build for Production

```bash
npm run build
```

## Preview the Built App

```bash
npm run preview
```

## Recommended Verification After Setup

```bash
npm run lint
npm run test:run
npm run build
```

Run Playwright when browser validation is needed:

```bash
npm run test:e2e
```

## Setup Notes

- The app is configured for GitHub Pages and uses a repository base path in production.
- Local development still runs from `/` as a normal Vite app.
- The runtime feed reads local `public/data` files during development and production builds.
