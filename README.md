# Clearwell symptom explorer

A local-first React educational symptom checker. It supports symptom search and browsing, live illustrative pattern matches, editable saved checks, and device-local history.

## Deployed in vercel

simptoms-prediciton-teal.vercel.app

sorry

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

The project pins Vite's `esbuild` dependency in `package-lock.json` and explicitly allows that exact version's install script in `package.json` for npm versions that block unapproved dependency scripts.

## Model and safety

The app trains a small Naive Bayes model in the browser at startup from the invented example records bundled in `src/model.js`. The examples are for demonstrating how a transparent model can rank symptom patterns; they are not a clinical dataset. The displayed score is a relative demo match score—not a probability, medical assessment, or diagnosis. This model has not been clinically validated.

Selected urgent symptoms bypass the model and all condition suggestions. The app instead tells users to contact emergency services or seek emergency care. This educational tool cannot assess or rule out a health condition. Saved checks stay in the current browser's local storage and are not sent to a server.
