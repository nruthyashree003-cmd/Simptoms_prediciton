# Clearwell Symptom Explorer

## 1. What this software does

Clearwell is a small, browser-based React application for exploring common symptom patterns. A user can search and select symptoms, see educational pattern matches update immediately, read a reference library, and save, edit, reload, or delete previous checks.

This is a learning project, not a medical product. It does not diagnose illness, recommend treatment, or replace advice from a qualified health professional.

## 2. How to run the application

Install Node.js, open a terminal in the project directory, then run:

```powershell
cd D:\Nruthya_react_project
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To create and test a production build:

```powershell
npm run build
```

The compiled site is written to the `dist` directory. For deployment, the hosting service should install dependencies from `package-lock.json` and run `npm run build`.

## 3. Example walkthroughs

### Example A: Explore cold-like symptoms

1. Open **Symptom check**.
2. Search for and select **Runny nose**, **Sore throat**, and **Cough**.
3. The results panel updates as the selections change. It may show **Common cold pattern** near the top because those symptoms overlap with the bundled teaching examples for that pattern.
4. The page lists shared signals so the user can see why a pattern appeared.
5. Select another symptom or remove one from the selection to update the results immediately.
6. Choose **Save this check** to save it in the current browser.

This result is only a demonstration of matching symptom patterns. It does not establish that the user has a cold.

### Example B: An urgent symptom

1. Search for and select **Chest pain** or **Trouble breathing**.
2. Clearwell displays urgent-care guidance instead of condition suggestions.
3. A saved check with an urgent symptom has no condition matches.

This behavior is a safety feature, not a way to determine whether a symptom is dangerous. If symptoms are severe or urgent, seek appropriate emergency help rather than relying on the app.

## 4. How the application works

### User interface and state

The React interface is in `src/App.jsx`; styling is in `src/styles.css`. React state tracks the selected symptoms, search text, current page section, loading status, and selected history item being edited. When the user changes symptoms, React recalculates the results and redraws the relevant interface.

The symptom and condition catalogs, teaching examples, model training, and ranking code are in `src/model.js`. The library view searches the symptom and condition descriptions locally.

### Saving and removing checks

Saved checks are stored in the browser's `localStorage`, under the key `clearwell-symptom-checks-v1`. They are kept on that device and are not uploaded to a server. The app keeps up to 12 recent checks. Deleting a check asks for confirmation first.

### Loading state

When the page starts, the interface briefly shows a loading state and then trains the small demo model in the browser. There is no remote model server or external AI API.

## 5. Technical explanation of the model

The current model is a small **Naive Bayes classifier** implemented directly in JavaScript. It is included to demonstrate a basic machine-learning workflow:

1. **Training examples:** `src/model.js` contains 21 invented example records. Each record has a pattern label and a list of symptoms.
2. **Counting:** At startup, `trainModel()` counts how often each symptom appears for each pattern and computes a prior from the number of examples for that pattern.
3. **Scoring:** `rankConditions()` evaluates each pattern against the selected symptoms. It uses a Bernoulli Naive Bayes-style calculation: each catalog symptom contributes evidence for being present or absent. Add-one smoothing avoids zero probabilities for symptom combinations not represented in the small sample.
4. **Ranking:** Patterns are ordered by the model's internal log score, and up to three are shown.
5. **Explanation:** The interface lists the selected symptoms that overlap with each pattern's feature list.

The displayed number is a **relative demo match score**, not a calibrated probability or a measure of medical risk. In this implementation, the display number is derived from result rank and the count of shared signals; it is not the classifier's posterior probability. The small invented examples are not a clinical dataset and cannot establish real-world accuracy.

The urgent-symptom check happens in the application interface before results are rendered. When a selected symptom is marked as urgent in the catalog, Clearwell suppresses all condition suggestions.

## 6. Technologies and why they are used

| Technology | How it is used | Why it fits this project |
|---|---|---|
| React 18 | Builds the interactive interface from components and state | Makes selections, search, and live result updates easier to manage |
| JavaScript ES modules | Implements catalog handling, local model training, and ranking | Keeps the educational demo logic readable and runs in the browser |
| CSS | Provides layout, responsive styling, colors, and visual feedback | Avoids adding a UI framework for a small app |
| Vite | Runs the development server and builds the production site | Provides a lightweight React development and build workflow |
| Browser `localStorage` | Persists saved checks on the current device | Enables history without a backend or account |
| npm | Installs and locks project dependencies | Makes local setup and repeatable deployment builds straightforward |

The app has no database, API server, account system, or external AI service. This keeps the project simple, but also means saved history is limited to the user's browser and is not synchronized across devices.

## 7. Important limitations and privacy

- This is an educational demonstration, not a diagnostic or treatment tool.
- The bundled examples are invented teaching data, not a sourced or clinically validated dataset.
- The model's matches and scores must not be used to make medical decisions.
- A real medical model would need an appropriate, consented and de-identified dataset, careful data-quality review, independent testing, clinical and regulatory review as applicable, and ongoing monitoring.
- The app stores saved checks locally in the browser. Clearing browser storage removes them. It does not currently send check data to a server.
- Do not enter personal identifying or sensitive medical information into this demo.

