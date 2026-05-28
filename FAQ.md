# FAQ

## What is this project?

This is a minimalist GPX track index with search and direct file download.

## Where does the app read GPX files from?

It reads files from the `gpx/` directory in this repository.

## What GPX file naming format is required?

Use: `YYYY-MM-DD-name.gpx`, for example `2026-05-28-beskid-wyspowy.gpx`.

## How do I run the project locally?

1. Install dependencies: `npm install`
2. Start the local server: `npm run dev`
3. Open `http://localhost:8080`

## How do I run tests locally?

Run: `npm test`

## What does CI validate?

CI validates commit messages (Conventional Commits) and runs tests.

## Does the repository need to be public?

Yes, if the browser app should fetch file listings through the GitHub API.
