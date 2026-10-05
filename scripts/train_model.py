import argparse
import csv
import json
import random
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = ROOT / "dataset" / "Final_Augmented_dataset_Diseases_and_Symptoms.csv"
DEFAULT_OUTPUT = ROOT / "src" / "trained-model.json"
SAMPLE_LIMIT = 1000
SEED = 42


def apportion_quotas(class_counts, sample_limit):
    if len(class_counts) > sample_limit:
        raise ValueError(
            f"{len(class_counts)} disease labels exceed the {sample_limit}-record "
            "sample limit; cannot include every label."
        )

    quotas = {label: 1 for label in class_counts}
    remaining = sample_limit - len(quotas)
    while remaining:
        capacities = {
            label: count - quotas[label]
            for label, count in class_counts.items()
            if count > quotas[label]
        }
        total_capacity = sum(capacities.values())
        if not total_capacity:
            break

        allocations = {}
        fractions = []
        allocated = 0
        for label, capacity in capacities.items():
            exact = remaining * capacity / total_capacity
            amount = min(capacity, int(exact))
            allocations[label] = amount
            allocated += amount
            fractions.append((exact - int(exact), label))

        for label, amount in allocations.items():
            quotas[label] += amount
        remaining -= allocated

        if remaining:
            for _, label in sorted(fractions, key=lambda item: (-item[0], item[1])):
                if remaining == 0:
                    break
                if quotas[label] < class_counts[label]:
                    quotas[label] += 1
                    remaining -= 1

    return quotas


def slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "_", text.casefold()).strip("_")
    return slug or "unnamed"


def display_name(text):
    return " ".join(word.capitalize() for word in text.replace("_", " ").split())


def inspect_dataset(path):
    label_counts = Counter()
    with path.open("r", newline="", encoding="utf-8-sig") as dataset:
        reader = csv.reader(dataset)
        try:
            header = next(reader)
        except StopIteration as error:
            raise ValueError("Dataset file is empty.") from error

        if not header or header[0].strip().casefold() != "diseases":
            raise ValueError("Expected the first CSV column to be named 'diseases'.")
        if len(header) < 2:
            raise ValueError("Dataset must contain at least one symptom feature.")

        symptom_names = [name.strip() for name in header[1:]]
        if any(not name for name in symptom_names):
            raise ValueError("Dataset contains an empty symptom column name.")
        if len({name.casefold() for name in symptom_names}) != len(symptom_names):
            raise ValueError("Dataset contains duplicate symptom column names.")

        for row_number, row in enumerate(reader, start=2):
            if len(row) != len(header):
                raise ValueError(f"Row {row_number} has an unexpected number of columns.")
            label = row[0].strip()
            if not label:
                raise ValueError(f"Row {row_number} has an empty disease label.")
            label_counts[label] += 1

    if sum(label_counts.values()) < SAMPLE_LIMIT:
        raise ValueError(f"Dataset has fewer than {SAMPLE_LIMIT} usable records.")
    return symptom_names, label_counts


def select_stratified_examples(path, symptom_names, label_counts, quotas):
    rng = random.Random(SEED)
    reservoirs = {label: [] for label in quotas}
    seen = Counter()

    with path.open("r", newline="", encoding="utf-8-sig") as dataset:
        reader = csv.reader(dataset)
        next(reader)
        for row_number, row in enumerate(reader, start=2):
            if len(row) != len(symptom_names) + 1:
                raise ValueError(f"Row {row_number} has an unexpected number of columns.")

            label = row[0].strip()
            if label not in quotas:
                continue
            present = []
            for feature_index, value in enumerate(row[1:]):
                normalized = value.strip()
                if normalized not in ("0", "1", "0.0", "1.0"):
                    raise ValueError(
                        f"Row {row_number}, symptom column {feature_index + 2} "
                        "contains a value other than 0 or 1."
                    )
                if normalized in ("1", "1.0"):
                    present.append(feature_index)

            seen[label] += 1
            reservoir = reservoirs[label]
            quota = quotas[label]
            if len(reservoir) < quota:
                reservoir.append(present)
            else:
                replacement_index = rng.randrange(seen[label])
                if replacement_index < quota:
                    reservoir[replacement_index] = present

    if sum(map(len, reservoirs.values())) != SAMPLE_LIMIT:
        raise ValueError("Could not select exactly 1,000 records from the dataset.")
    return reservoirs


def train(path, output):
    symptom_names, label_counts = inspect_dataset(path)
    quotas = apportion_quotas(label_counts, SAMPLE_LIMIT)
    examples_by_class = select_stratified_examples(path, symptom_names, label_counts, quotas)

    conditions = []
    for label in sorted(examples_by_class, key=str.casefold):
        examples = examples_by_class[label]
        symptom_counts = Counter(index for example in examples for index in example)
        conditions.append(
            {
                "id": slugify(label),
                "name": display_name(label),
                "total": len(examples),
                "counts": sorted(
                    [[index, count] for index, count in symptom_counts.items()]
                ),
            }
        )

    ids = [condition["id"] for condition in conditions]
    if len(ids) != len(set(ids)):
        raise ValueError("Disease names produce duplicate identifiers after normalization.")

    model = {
        "version": 1,
        "algorithm": "bernoulli-naive-bayes",
        "sourceFile": path.name,
        "sampleCount": SAMPLE_LIMIT,
        "seed": SEED,
        "classCount": len(conditions),
        "symptoms": [
            {"id": slugify(name), "name": display_name(name)}
            for name in symptom_names
        ],
        "conditions": conditions,
    }
    symptom_ids = [symptom["id"] for symptom in model["symptoms"]]
    if len(symptom_ids) != len(set(symptom_ids)):
        raise ValueError("Symptom names produce duplicate identifiers after normalization.")

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="\n") as trained_file:
        json.dump(model, trained_file, ensure_ascii=False, separators=(",", ":"))
        trained_file.write("\n")

    print(
        f"Trained {model['algorithm']} from {SAMPLE_LIMIT} stratified records "
        f"across {len(conditions)} disease labels and {len(symptom_names)} symptoms."
    )
    print(f"Dataset: {path}")
    print(f"Model artifact: {output} ({output.stat().st_size:,} bytes)")


def main():
    parser = argparse.ArgumentParser(
        description="Create the local Clearwell Naive Bayes model from a stratified 1,000-row CSV sample."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    arguments = parser.parse_args()

    if not arguments.dataset.is_file():
        parser.error(f"dataset file not found: {arguments.dataset}")
    try:
        train(arguments.dataset, arguments.output)
    except (OSError, ValueError, csv.Error) as error:
        print(f"Training failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
