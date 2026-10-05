import modelData from './trained-model.json';

const urgentTerms = [
  'shortness of breath',
  'difficulty breathing',
  'difficulty in breathing',
  'trouble breathing',
  'chest pain',
  'chest pressure',
  'chest tightness',
  'burning chest pain',
  'sharp chest pain',
  'hurts to breath',
  'breathing fast',
  'fainting',
  'unconscious',
  'blue lips',
  'sudden weakness',
  'sudden confusion',
  'throat swelling',
  'throat feels tight',
  'seizures',
  'allergic reaction',
  'focal weakness',
];

export const sampleMetadata = {
  sampleCount: modelData.sampleCount,
  classCount: modelData.classCount,
  symptomCount: modelData.symptoms.length,
  sourceFile: modelData.sourceFile,
  seed: modelData.seed,
};

export const symptomCatalog = modelData.symptoms.map((symptom) => {
  const redFlag = urgentTerms.some((term) => symptom.name.toLowerCase().includes(term));
  return {
    ...symptom,
    group: redFlag ? 'Urgent symptoms' : 'Dataset symptoms',
    description: redFlag
      ? 'A symptom that may need urgent medical attention.'
      : 'A symptom feature from the provided training dataset.',
    redFlag,
  };
});

export const conditionCatalog = modelData.conditions.map((condition) => ({
  id: condition.id,
  name: condition.name,
  description: 'A disease label found in the stratified dataset sample; this is not a clinical diagnosis.',
  advice: 'Discuss symptoms and health concerns with a qualified health professional.',
  features: condition.counts.map(([featureIndex]) => symptomCatalog[featureIndex].id),
}));

const symptomIndex = new Map(symptomCatalog.map(({ id }, index) => [id, index]));

export function trainModel() {
  const classes = new Map();

  for (const condition of modelData.conditions) {
    const counts = new Uint16Array(symptomCatalog.length);
    for (const [featureIndex, count] of condition.counts) {
      counts[featureIndex] = count;
    }
    classes.set(condition.id, {
      prior: condition.total / modelData.sampleCount,
      total: condition.total,
      counts,
    });
  }

  return classes;
}

export function rankConditions(selectedIds, model) {
  if (!selectedIds.length) return [];

  const selected = new Set(
    selectedIds.map((id) => symptomIndex.get(id)).filter((index) => index !== undefined),
  );
  const ranked = conditionCatalog.map((condition) => {
    const modelClass = model.get(condition.id);
    let logScore = Math.log(modelClass.prior);
    const evidence = [];

    for (let index = 0; index < symptomCatalog.length; index += 1) {
      const symptom = symptomCatalog[index];
      const presentProbability = (modelClass.counts[index] + 1) / (modelClass.total + 2);
      logScore += Math.log(selected.has(index) ? presentProbability : 1 - presentProbability);
      if (selected.has(index) && modelClass.counts[index] > 0) evidence.push(symptom.id);
    }

    return { ...condition, logScore, evidence };
  }).sort((a, b) => b.logScore - a.logScore);

  const bestScore = ranked[0].logScore;
  return ranked.slice(0, 3).map((condition) => ({
    ...condition,
    score: Math.max(1, Math.round(Math.exp(condition.logScore - bestScore) * 100)),
  }));
}

export const redFlagAdvice = 'Some symptoms you selected can be urgent. Please contact your local emergency number or seek emergency care now. Do not wait for this tool or use its results to decide whether to get help.';
