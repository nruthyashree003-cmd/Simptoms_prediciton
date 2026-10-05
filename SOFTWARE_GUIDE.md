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
2. Search for and select symptoms such as **Runny nose**, **Sore throat**, and **Cough** if they appear in the loaded dataset catalog.
3. The results panel updates as the selections change and ranks disease labels using the local model.
4. The page lists selected symptoms found in each label's training records so the user can see some of the shared signals.
5. Select another symptom or remove one from the selection to update the results immediately.
6. Choose **Save this check** to save it in the current browser.

These results are only experimental dataset matches. They do not establish that the user has any listed disease.

### Example B: An urgent symptom

1. Search for and select **Shortness Of Breath**, **Difficulty Breathing**, or **Sharp Chest Pain** from the CSV-derived catalog.
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

When the page starts, the interface briefly shows a loading state while the browser prepares the locally bundled model artifact. There is no remote model server or external AI API.

## 5. Technical explanation of the model

The current model is a **Bernoulli Naive Bayes classifier** implemented directly in JavaScript. Its parameters are generated offline by `scripts/train_model.py` from the provided CSV:

1. **Input data:** A CSV row contains a disease label and 377 binary symptom columns.
2. **Stratified sampling:** The Python script reads the full dataset, assigns every disease label at least one sample, then distributes the remaining places proportionally across labels. Sampling is deterministic (seed `42`) and totals 1,000 records.
3. **Training:** The script counts symptom-presence values for each disease in the selected sample and writes aggregate counts to `src/trained-model.json`; individual source records are not included in the app bundle.
4. **Scoring:** In the browser, `trainModel()` prepares the stored class counts and priors. `rankConditions()` evaluates each disease against selected and unselected symptom features. Add-one smoothing avoids zero probabilities.
5. **Ranking and explanation:** The disease labels are ordered by their internal log scores, and up to three are shown. The interface lists selected symptoms observed in each label's training records.

The displayed number is a **relative match score**, not a calibrated probability or a measure of medical risk. It compares classifier scores to the highest-ranked result. The 1,000-record sample covers 773 labels, leaving many labels with only one or two examples; the dataset's origin and clinical representativeness have not been independently verified. This cannot establish real-world accuracy.

The urgent-symptom check happens in the application interface before results are rendered. A small list of high-risk symptom phrases is marked in the catalog; when one is selected, Clearwell suppresses all condition suggestions.

## 6. Technologies and why they are used

| Technology | How it is used | Why it fits this project |
|---|---|---|
| React 18 | Builds the interactive interface from components and state | Makes selections, search, and live result updates easier to manage |
| JavaScript ES modules | Implements catalog handling, local model training, and ranking | Keeps the educational demo logic readable and runs in the browser |
| CSS | Provides layout, responsive styling, colors, and visual feedback | Avoids adding a UI framework for a small app |
| Vite | Runs the development server and builds the production site | Provides a lightweight React development and build workflow |
| Python standard library | Selects and aggregates the stratified dataset sample before deployment | Processes the large CSV without adding training dependencies |
| Browser `localStorage` | Persists saved checks on the current device | Enables history without a backend or account |
| npm | Installs and locks project dependencies | Makes local setup and repeatable deployment builds straightforward |

The app has no database, API server, account system, or external AI service. This keeps the project simple, but also means saved history is limited to the user's browser and is not synchronized across devices.

## 7. Important limitations and privacy

- This is an educational demonstration, not a diagnostic or treatment tool.
- The selected 1,000 examples come from the user-provided CSV, but the dataset's provenance and representativeness have not been independently verified.
- The sample spans 773 disease labels, so many labels have only one or two examples and predictions may be unreliable.
- The model's matches and scores must not be used to make medical decisions.
- A real medical model would need an appropriate, consented and de-identified dataset, careful data-quality review, independent testing, clinical and regulatory review as applicable, and ongoing monitoring.
- The app stores saved checks locally in the browser. Clearing browser storage removes them. It does not currently send check data to a server.
- Do not enter personal identifying or sensitive medical information into this demo.
