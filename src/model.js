export const symptomCatalog = [
  { id: 'runny_nose', name: 'Runny nose', group: 'Nose & throat', description: 'A drippy or blocked nose.' },
  { id: 'sneezing', name: 'Sneezing', group: 'Nose & throat', description: 'Repeated involuntary sneezes.' },
  { id: 'sore_throat', name: 'Sore throat', group: 'Nose & throat', description: 'Scratchiness or pain in the throat.' },
  { id: 'cough', name: 'Cough', group: 'Nose & throat', description: 'A cough that may be dry or produce mucus.' },
  { id: 'fever', name: 'Fever', group: 'Whole body', description: 'Feeling feverish or a measured high temperature.' },
  { id: 'fatigue', name: 'Fatigue', group: 'Whole body', description: 'Unusual tiredness or low energy.' },
  { id: 'body_aches', name: 'Body aches', group: 'Whole body', description: 'Muscle or joint aches.' },
  { id: 'headache', name: 'Headache', group: 'Head', description: 'Pain or pressure in the head.' },
  { id: 'light_sensitivity', name: 'Light sensitivity', group: 'Head', description: 'Bright light feels uncomfortable.' },
  { id: 'nausea', name: 'Nausea', group: 'Stomach', description: 'An unsettled feeling in the stomach.' },
  { id: 'vomiting', name: 'Vomiting', group: 'Stomach', description: 'Being sick or throwing up.' },
  { id: 'diarrhea', name: 'Diarrhea', group: 'Stomach', description: 'Loose or watery stools.' },
  { id: 'stomach_cramps', name: 'Stomach cramps', group: 'Stomach', description: 'Cramping or discomfort in the abdomen.' },
  { id: 'itchy_eyes', name: 'Itchy eyes', group: 'Eyes & skin', description: 'Eyes feel itchy or watery.' },
  { id: 'watery_eyes', name: 'Watery eyes', group: 'Eyes & skin', description: 'Eyes water more than usual.' },
  { id: 'rash', name: 'Rash', group: 'Eyes & skin', description: 'A visible change or irritation on the skin.' },
  { id: 'heartburn', name: 'Heartburn', group: 'Stomach', description: 'A burning sensation in the chest after eating.' },
  { id: 'stuffy_nose', name: 'Stuffy nose', group: 'Nose & throat', description: 'A blocked or congested nose.' },
  { id: 'chills', name: 'Chills', group: 'Whole body', description: 'Shivering or feeling unusually cold.' },
  { id: 'dizziness', name: 'Dizziness', group: 'Whole body', description: 'Feeling lightheaded or unsteady.' },
  { id: 'trouble_breathing', name: 'Trouble breathing', group: 'Urgent symptoms', description: 'Breathing feels difficult or unusually labored.', redFlag: true },
  { id: 'chest_pain', name: 'Chest pain', group: 'Urgent symptoms', description: 'New, severe, or unexplained pain or pressure in the chest.', redFlag: true },
  { id: 'confusion', name: 'Sudden confusion', group: 'Urgent symptoms', description: 'New difficulty thinking clearly or staying oriented.', redFlag: true },
  { id: 'fainting', name: 'Fainting', group: 'Urgent symptoms', description: 'Passing out or being difficult to wake.', redFlag: true },
  { id: 'severe_bleeding', name: 'Severe bleeding', group: 'Urgent symptoms', description: 'Bleeding that is heavy or will not stop.', redFlag: true },
  { id: 'blue_lips', name: 'Blue or gray lips', group: 'Urgent symptoms', description: 'An unusual blue or gray color around the lips or face.', redFlag: true },
  { id: 'sudden_weakness', name: 'Sudden one-sided weakness', group: 'Urgent symptoms', description: 'Sudden weakness or numbness, especially on one side.', redFlag: true },
  { id: 'severe_allergic_reaction', name: 'Severe allergic reaction', group: 'Urgent symptoms', description: 'Rapid swelling of the face or tongue, or a severe reaction.', redFlag: true },
];

export const conditionCatalog = [
  {
    id: 'common-cold',
    name: 'Common cold pattern',
    description: 'A familiar combination of nose or throat symptoms that often comes on gradually.',
    advice: 'Rest, fluids, and checking in with a clinician if symptoms worsen or concern you.',
    features: ['runny_nose', 'sore_throat', 'cough', 'stuffy_nose', 'sneezing', 'fatigue'],
  },
  {
    id: 'seasonal-allergies',
    name: 'Seasonal allergy pattern',
    description: 'Nose and eye irritation that may be associated with environmental triggers.',
    advice: 'Consider discussing persistent symptoms and options with a clinician or pharmacist.',
    features: ['sneezing', 'runny_nose', 'itchy_eyes', 'watery_eyes', 'stuffy_nose'],
  },
  {
    id: 'flu-like',
    name: 'Flu-like pattern',
    description: 'A cluster of whole-body symptoms that can include fever, chills, and aches.',
    advice: 'A clinician can help decide whether testing or care is appropriate, especially if you are at higher risk.',
    features: ['fever', 'chills', 'body_aches', 'fatigue', 'headache', 'cough'],
  },
  {
    id: 'migraine-like',
    name: 'Migraine-like headache pattern',
    description: 'Head pain sometimes accompanied by light sensitivity or nausea.',
    advice: 'If headaches are new, severe, changing, or concerning, seek medical advice.',
    features: ['headache', 'light_sensitivity', 'nausea', 'vomiting', 'dizziness'],
  },
  {
    id: 'stomach-bug',
    name: 'Stomach upset pattern',
    description: 'Digestive symptoms that may occur together, such as nausea or loose stools.',
    advice: 'Focus on fluids if you can; contact a clinician for persistent symptoms or signs of dehydration.',
    features: ['nausea', 'vomiting', 'diarrhea', 'stomach_cramps', 'fever', 'fatigue'],
  },
  {
    id: 'tension-headache',
    name: 'Tension-type headache pattern',
    description: 'Headache or pressure that may appear alongside tiredness or muscle tension.',
    advice: 'A clinician can help if headaches persist, recur, or interfere with daily life.',
    features: ['headache', 'fatigue', 'dizziness'],
  },
  {
    id: 'reflux',
    name: 'Reflux-like discomfort pattern',
    description: 'Burning discomfort that can happen after meals or when lying down.',
    advice: 'Discuss frequent or persistent heartburn with a clinician. Chest pain needs urgent assessment.',
    features: ['heartburn', 'nausea', 'cough', 'sore_throat'],
  },
];

const trainingExamples = [
  ['common-cold', ['runny_nose', 'sore_throat', 'cough', 'stuffy_nose']],
  ['common-cold', ['sneezing', 'runny_nose', 'sore_throat', 'fatigue']],
  ['common-cold', ['cough', 'stuffy_nose', 'fatigue', 'sore_throat']],
  ['seasonal-allergies', ['sneezing', 'runny_nose', 'itchy_eyes', 'watery_eyes']],
  ['seasonal-allergies', ['itchy_eyes', 'sneezing', 'stuffy_nose']],
  ['seasonal-allergies', ['runny_nose', 'watery_eyes', 'sneezing']],
  ['flu-like', ['fever', 'chills', 'body_aches', 'fatigue', 'cough']],
  ['flu-like', ['fever', 'headache', 'body_aches', 'fatigue']],
  ['flu-like', ['chills', 'fever', 'cough', 'headache']],
  ['migraine-like', ['headache', 'light_sensitivity', 'nausea']],
  ['migraine-like', ['headache', 'nausea', 'vomiting', 'light_sensitivity']],
  ['migraine-like', ['headache', 'dizziness', 'light_sensitivity']],
  ['stomach-bug', ['nausea', 'vomiting', 'stomach_cramps']],
  ['stomach-bug', ['diarrhea', 'stomach_cramps', 'nausea', 'fatigue']],
  ['stomach-bug', ['fever', 'diarrhea', 'vomiting', 'stomach_cramps']],
  ['tension-headache', ['headache', 'fatigue']],
  ['tension-headache', ['headache', 'dizziness']],
  ['tension-headache', ['headache', 'fatigue', 'dizziness']],
  ['reflux', ['heartburn', 'nausea']],
  ['reflux', ['heartburn', 'cough', 'sore_throat']],
  ['reflux', ['heartburn', 'nausea', 'cough']],
];

export function trainModel() {
  const classes = new Map();
  for (const condition of conditionCatalog) {
    const examples = trainingExamples.filter(([label]) => label === condition.id);
    const counts = Object.fromEntries(symptomCatalog.map(({ id }) => [id, 0]));
    for (const [, present] of examples) {
      for (const id of present) counts[id] += 1;
    }
    classes.set(condition.id, { prior: examples.length / trainingExamples.length, total: examples.length, counts });
  }
  return classes;
}

export function rankConditions(selectedIds, model) {
  if (!selectedIds.length) return [];
  const totalSymptoms = symptomCatalog.length;
  return conditionCatalog.map((condition) => {
    const modelClass = model.get(condition.id);
    let logScore = Math.log(modelClass.prior);
    for (const symptom of symptomCatalog) {
      const presentCount = modelClass.counts[symptom.id];
      const presentProbability = (presentCount + 1) / (modelClass.total + 2);
      logScore += Math.log(selectedIds.includes(symptom.id) ? presentProbability : 1 - presentProbability);
    }
    const evidence = selectedIds.filter((id) => condition.features.includes(id));
    return { ...condition, logScore, evidence };
  })
    .sort((a, b) => b.logScore - a.logScore)
    .slice(0, 3)
    .map((condition, index) => ({
      ...condition,
      score: Math.max(20, Math.min(94, Math.round(80 - index * 17 + condition.evidence.length * 4))),
    }));
}

export const redFlagAdvice = 'Some symptoms you selected can be urgent. Please contact your local emergency number or seek emergency care now. Do not wait for this tool or use its results to decide whether to get help.';
