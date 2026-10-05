# Clearwell symptom explorer

A local-first React educational symptom checker. It supports symptom search and browsing, live dataset-based pattern matches, editable saved checks, and device-local history.

## Deployed Link in Vercel

simptoms-prediciton-f4vy.vercel.app
[Symptoms Prediction App](https://simptoms-prediciton-f4vy.vercel.app/)

## Run locally

```powershell
npm install
npm run dev
```

Create a production build with `npm run build`.

## Train the local demo model

The provided CSV is intentionally excluded from Git because it is large. To retrain the model, place it at:

```text
dataset/Final_Augmented_dataset_Diseases_and_Symptoms.csv
```

Then run:

```powershell
python scripts/train_model.py
npm run build
```

The script uses a deterministic, disease-stratified 1,000-record sample (seed `42`), includes every disease label when possible, and writes the aggregate model artifact to `src/trained-model.json`. It does not put the source CSV or individual sample records into the application bundle. The browser loads this pre-trained artifact; it does not train on startup. Re-run the script after replacing the source dataset.

## Model and safety

The browser uses a Bernoulli Naive Bayes classifier with add-one smoothing over the 377 symptom features. The selected sample covers 773 disease labels, so many labels have very few training examples. The displayed relative match score is not a probability, medical assessment, or diagnosis.

The dataset's origin and clinical representativeness have not been independently verified. This model has not been clinically validated and must not be used for medical decisions. Urgent symptoms suppress condition suggestions and show urgent-care guidance; this is not a substitute for professional assessment.

Saved checks remain in the current browser's local storage. They are not sent to a server. Do not enter identifying or sensitive medical information into this educational demo.
