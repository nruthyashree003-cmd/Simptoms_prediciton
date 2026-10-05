import { useEffect, useMemo, useState } from 'react';
import { conditionCatalog, rankConditions, redFlagAdvice, sampleMetadata, symptomCatalog, trainModel } from './model.js';

const HISTORY_KEY = 'clearwell-symptom-checks-v1';
const legacySymptomNames = {
  runny_nose: 'Runny nose',
  sneezing: 'Sneezing',
  sore_throat: 'Sore throat',
  cough: 'Cough',
  fever: 'Fever',
  fatigue: 'Fatigue',
  body_aches: 'Body aches',
  headache: 'Headache',
  light_sensitivity: 'Light sensitivity',
  nausea: 'Nausea',
  vomiting: 'Vomiting',
  diarrhea: 'Diarrhea',
  stomach_cramps: 'Stomach cramps',
  itchy_eyes: 'Itchy eyes',
  watery_eyes: 'Watery eyes',
  rash: 'Rash',
  heartburn: 'Heartburn',
  stuffy_nose: 'Stuffy nose',
  chills: 'Chills',
  dizziness: 'Dizziness',
  trouble_breathing: 'Trouble breathing',
  chest_pain: 'Chest pain',
  confusion: 'Sudden confusion',
  fainting: 'Fainting',
  severe_bleeding: 'Severe bleeding',
  blue_lips: 'Blue or gray lips',
  sudden_weakness: 'Sudden one-sided weakness',
  severe_allergic_reaction: 'Severe allergic reaction',
};
const legacyConditionNames = {
  'common-cold': 'Common cold pattern',
  'seasonal-allergies': 'Seasonal allergy pattern',
  'flu-like': 'Flu-like pattern',
  'migraine-like': 'Migraine-like headache pattern',
  'stomach-bug': 'Stomach upset pattern',
  'tension-headache': 'Tension-type headache pattern',
  reflux: 'Reflux-like discomfort pattern',
};
const legacyUrgentIds = new Set([
  'trouble_breathing',
  'chest_pain',
  'confusion',
  'fainting',
  'severe_bleeding',
  'blue_lips',
  'sudden_weakness',
  'severe_allergic_reaction',
]);

function readableId(id) {
  return id.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function App() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(readHistory);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState('checker');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setModel(trainModel());
      setLoading(false);
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const redFlags = selected.filter((id) =>
    symptomCatalog.find((symptom) => symptom.id === id)?.redFlag || legacyUrgentIds.has(id),
  );
  const supportedSelected = selected.filter((id) => symptomCatalog.some((symptom) => symptom.id === id));
  const unsupportedSelected = selected.filter((id) => !symptomCatalog.some((symptom) => symptom.id === id));
  const matches = useMemo(
    () => (model && !redFlags.length ? rankConditions(supportedSelected, model) : []),
    [model, supportedSelected, redFlags.length],
  );
  const filteredSymptoms = symptomCatalog.filter((symptom) =>
    symptom.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const librarySymptoms = symptomCatalog.filter((symptom) =>
    `${symptom.name} ${symptom.description}`.toLowerCase().includes(libraryQuery.trim().toLowerCase()),
  );
  const libraryConditions = conditionCatalog.filter((condition) =>
    `${condition.name} ${condition.description}`.toLowerCase().includes(libraryQuery.trim().toLowerCase()),
  );

  function toggleSymptom(id) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function startNewCheck() {
    setSelected([]);
    setEditingId(null);
    setNotice('');
    setView('checker');
  }

  function saveCheck() {
    if (!selected.length) {
      setNotice('Select at least one symptom before saving a check.');
      return;
    }
    const check = {
      id: editingId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: new Date().toISOString(),
      symptoms: selected,
      topMatches: redFlags.length ? [] : matches.slice(0, 2).map(({ id }) => id),
    };
    setHistory((current) => editingId
      ? current.map((item) => item.id === editingId ? check : item)
      : [check, ...current].slice(0, 12));
    setEditingId(null);
    setNotice('Check saved on this device.');
    window.setTimeout(() => setNotice(''), 2600);
  }

  function editCheck(check) {
    setSelected(check.symptoms);
    setEditingId(check.id);
    setNotice('');
    setView('checker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteCheck(id) {
    if (!window.confirm('Delete this saved symptom check? This cannot be undone.')) return;
    setHistory((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setSelected([]);
    }
  }

  function loadCheck(check) {
    setSelected(check.symptoms);
    setEditingId(null);
    setView('checker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getSymptomName(id) {
    return symptomCatalog.find((symptom) => symptom.id === id)?.name || legacySymptomNames[id] || readableId(id);
  }

  function getConditionName(id) {
    return conditionCatalog.find((condition) => condition.id === id)?.name || legacyConditionNames[id] || readableId(id);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Clearwell home" onClick={() => setView('checker')}>
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-name">clearwell</span>
        </a>
        <div className="topbar-right">
          <span className="demo-tag"><i /> Educational demo</span>
          <button className="text-button" onClick={() => setView(view === 'library' ? 'checker' : 'library')}>
            {view === 'library' ? 'Symptom checker' : 'Explore library'}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="intro">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> YOUR HEALTH, IN CONTEXT</div>
            <h1>A clearer first step<br /><em>starts here.</em></h1>
            <p className="intro-copy">Explore common symptoms and learn what patterns may be worth discussing with a health professional.</p>
          </div>
          <aside className="safety-note">
            <span className="safety-icon" aria-hidden="true">!</span>
            <div><strong>For learning, not diagnosis</strong><p>This demo cannot assess your health. If symptoms feel severe or urgent, seek professional care.</p></div>
          </aside>
        </section>

        <nav className="page-tabs" aria-label="Main sections">
          <button className={view === 'checker' ? 'active' : ''} onClick={() => setView('checker')}>Symptom check <span>01</span></button>
          <button className={view === 'library' ? 'active' : ''} onClick={() => setView('library')}>Browse library <span>02</span></button>
          <a href="#recent">Recent checks <span>{String(history.length).padStart(2, '0')}</span></a>
        </nav>

        {view === 'checker' ? (
          <section className="workspace">
            <div className="checker-column">
              <section className="panel symptom-panel" aria-labelledby="symptom-heading">
                <div className="panel-head">
                  <div><div className="step-label">STEP 01 <span>·</span> YOUR EXPERIENCE</div><h2 id="symptom-heading">What are you noticing?</h2></div>
                  <span className="selected-count">{String(selected.length).padStart(2, '0')} selected</span>
                </div>
                <p className="panel-lead">Choose anything that feels relevant. You can update these at any time.</p>
                <label className="search-field">
                  <span aria-hidden="true" className="search-icon">⌕</span>
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symptoms" aria-label="Search symptoms" />
                </label>
                <div className="symptom-scroll">
                  {loading ? (
                    <div className="loading-box" role="status"><span className="spinner" /> Loading the local learning model…</div>
                  ) : filteredSymptoms.length ? (
                    <>
                      {filteredSymptoms.filter((item) => !item.redFlag).map((symptom) => (
                        <button key={symptom.id} className={`symptom-option ${selected.includes(symptom.id) ? 'chosen' : ''}`} onClick={() => toggleSymptom(symptom.id)} aria-pressed={selected.includes(symptom.id)}>
                          <span className="checkmark">{selected.includes(symptom.id) ? '✓' : '+'}</span>{symptom.name}
                        </button>
                      ))}
                      {filteredSymptoms.some((item) => item.redFlag) && (
                        <div className="urgent-options"><div className="group-caption urgent-caption">URGENT SYMPTOMS</div>
                          {filteredSymptoms.filter((item) => item.redFlag).map((symptom) => (
                            <button key={symptom.id} className={`symptom-option urgent-option ${selected.includes(symptom.id) ? 'chosen' : ''}`} onClick={() => toggleSymptom(symptom.id)} aria-pressed={selected.includes(symptom.id)}>
                              <span className="checkmark">{selected.includes(symptom.id) ? '✓' : '+'}</span>{symptom.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : <div className="empty-inline">No symptoms match “{query}”. Try a different search.</div>}
                </div>
                <div className="selected-area">
                  <div className="selected-heading"><span>YOUR SELECTION</span><button className="quiet-button" onClick={startNewCheck} disabled={!selected.length && !editingId}>Clear all</button></div>
                  {selected.length ? <div className="selected-chips">{selected.map((id) => {
                    const symptom = symptomCatalog.find((item) => item.id === id);
                    return <button className={`selected-chip ${symptom?.redFlag ? 'red-chip' : ''}`} key={id} onClick={() => toggleSymptom(id)} aria-label={`Remove ${getSymptomName(id)}`}>{getSymptomName(id)} <span>×</span></button>;
                  })}</div> : <p className="selection-empty">Your chosen symptoms will appear here.</p>}
                </div>
                <div className="panel-actions">
                  <button className="primary-button" onClick={saveCheck}>{editingId ? 'Update saved check' : 'Save this check'} <span>↗</span></button>
                  {editingId && <button className="quiet-button cancel-edit" onClick={startNewCheck}>Cancel editing</button>}
                  {notice && <span className="inline-notice" role="status">{notice}</span>}
                </div>
              </section>
              <section className="model-note">
                <span className="model-glyph" aria-hidden="true">◎</span>
                <div><strong>About these results</strong><p>A Naive Bayes model was trained from {sampleMetadata.sampleCount.toLocaleString()} stratified dataset records with {sampleMetadata.symptomCount} symptom features across {sampleMetadata.classCount} disease labels. Some labels have only one training record, so results are experimental and may be unreliable. Scores are relative comparisons, not probabilities or diagnoses. This dataset has not been clinically validated.</p></div>
              </section>
            </div>

            <aside className="results-column" aria-live="polite">
              {redFlags.length ? (
                <section className="urgent-card">
                  <div className="urgent-top"><span className="urgent-symbol">!</span><span>URGENT GUIDANCE</span></div>
                  <h2>Please seek urgent care now.</h2>
                  <p>{redFlagAdvice}</p>
                  <div className="urgent-selected"><strong>Selected urgent symptom{redFlags.length > 1 ? 's' : ''}</strong><span>{redFlags.map(getSymptomName).join(' · ')}</span></div>
                  <p className="urgent-foot">No condition suggestions are shown for urgent symptoms.</p>
                </section>
              ) : (
                <section className="panel result-panel">
                  <div className="step-label">STEP 02 <span>·</span> LEARNING SIGNALS</div>
                  <div className="result-title-row"><h2>Patterns to explore</h2><span className="result-flower" aria-hidden="true">✳</span></div>
                  {!model ? <div className="loading-result"><span className="spinner" />Loading local model…</div> :
                    !selected.length ? (
                      <div className="results-empty"><div className="empty-orbit"><span>＋</span></div><strong>Your results will take shape here</strong><p>Select a few symptoms to see example patterns that share some of those signals.</p></div>
                    ) : !matches.length ? (
                      <div className="results-empty"><strong>These saved symptoms aren’t in the current dataset</strong><p>{unsupportedSelected.map(getSymptomName).join(', ')}. Add a symptom from the current catalog to see an educational match.</p></div>
                    ) : (
                      <>
                        <p className="match-explainer">Educational matches based on your selections. These are not a diagnosis.</p>
                        {unsupportedSelected.length > 0 && <p className="match-explainer">Older saved symptoms not included in this dataset are ignored: {unsupportedSelected.map(getSymptomName).join(', ')}.</p>}
                        <div className="match-list">{matches.map((condition, index) => (
                          <article className={`match-item ${index === 0 ? 'top-match' : ''}`} key={condition.id}>
                            <div className="match-heading"><div><span className="match-rank">0{index + 1}</span><h3>{condition.name}</h3></div><span className="match-score">{condition.score}<small> / 100</small></span></div>
                            <div className="score-track"><span style={{ width: `${condition.score}%` }} /></div>
                            <p>{condition.description}</p>
                            {condition.evidence.length > 0 && <div className="evidence"><span>SHARED SIGNALS</span><div>{condition.evidence.map((id) => <i key={id}>{getSymptomName(id)}</i>)}</div></div>}
                          </article>
                        ))}</div>
                        <div className="clinician-note"><span>↗</span><p>Consider sharing your symptoms with a clinician, especially if they persist or worsen.</p></div>
                      </>
                    )}
                </section>
              )}
              <section className="care-card">
                <span className="care-icon" aria-hidden="true">✳</span>
                <div><strong>Trust your instincts</strong><p>If something feels seriously wrong, seek help regardless of what this demo shows.</p><a href="#about">About this tool <span>↗</span></a></div>
              </section>
            </aside>
          </section>
        ) : (
          <section className="library-view panel">
            <div className="library-header"><div><div className="step-label">REFERENCE <span>·</span> PLAIN-LANGUAGE GUIDE</div><h2>Explore the library</h2><p>Search symptom features and disease labels included in this educational dataset model.</p></div><span className="library-count">{symptomCatalog.length} symptoms<br />{conditionCatalog.length} labels</span></div>
            <label className="search-field library-search"><span aria-hidden="true" className="search-icon">⌕</span><input type="search" value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search symptoms or patterns" aria-label="Search library" /></label>
            <div className="library-columns">
              <section><div className="library-section-head"><h3>Symptoms</h3><span>{librarySymptoms.length} entries</span></div>
                {librarySymptoms.length ? librarySymptoms.map((item) => <article className="library-entry" key={item.id}><div><h4>{item.name} {item.redFlag && <span className="urgent-label">URGENT</span>}</h4><p>{item.description}</p></div><span className="entry-group">{item.group}</span></article>) : <div className="empty-inline">No symptoms found.</div>}
              </section>
              <section><div className="library-section-head"><h3>Dataset labels</h3><span>{libraryConditions.length} entries</span></div>
                {libraryConditions.length ? libraryConditions.map((item) => <article className="library-entry condition-entry" key={item.id}><div><h4>{item.name}</h4><p>{item.description}</p><p className="advice-copy">{item.advice}</p></div></article>) : <div className="empty-inline">No patterns found.</div>}
              </section>
            </div>
          </section>
        )}

        <section id="recent" className="history-section">
          <div className="history-heading"><div><div className="step-label">YOUR DEVICE <span>·</span> PRIVATE HISTORY</div><h2>Recent checks</h2></div><button className="quiet-button" onClick={startNewCheck}>＋ Start a new check</button></div>
          {history.length ? <div className="history-list">{history.map((check) => (
            <article className="history-row" key={check.id}>
              <div className="history-date"><span className="calendar-mark">◷</span><div><strong>{new Date(check.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><small>{new Date(check.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</small></div></div>
              <div className="history-symptoms">{check.symptoms.slice(0, 3).map(getSymptomName).join(' · ')}{check.symptoms.length > 3 && ` +${check.symptoms.length - 3} more`}</div>
              <div className="history-matches">{check.topMatches?.length ? check.topMatches.map(getConditionName).join(' · ') : 'Urgent guidance'}</div>
              <div className="history-actions"><button onClick={() => loadCheck(check)} aria-label="View saved check">View</button><button onClick={() => editCheck(check)} aria-label="Edit saved check">Edit</button><button className="delete-button" onClick={() => deleteCheck(check.id)} aria-label="Delete saved check">Delete</button></div>
            </article>
          ))}</div> : <div className="history-empty"><span className="history-empty-mark">↳</span><div><strong>No saved checks yet</strong><p>Checks you save on this device will appear here for easy reference.</p></div></div>}
          <p className="privacy-line">Saved only in this browser on this device. No information is sent to a server.</p>
        </section>

        <footer id="about" className="footer">
          <div className="footer-brand"><span className="brand-mark" aria-hidden="true"><span /></span> clearwell</div>
          <p>Educational only · Not medical advice · Not clinically validated</p>
          <a href="#top">Back to top ↑</a>
        </footer>
      </main>
    </div>
  );
}

export default App;
