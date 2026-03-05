const STORAGE_KEY = 'mentat_predictions';

export function getAllPredictions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getPrediction(id) {
  return getAllPredictions().find(p => p.id === id) || null;
}

export function savePrediction(prediction) {
  const all = getAllPredictions();
  const idx = all.findIndex(p => p.id === prediction.id);
  const now = Date.now();

  if (idx >= 0) {
    all[idx] = { ...prediction, updatedAt: now };
  } else {
    all.push({
      ...prediction,
      id: prediction.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[idx >= 0 ? idx : all.length - 1];
}

export function deletePrediction(id) {
  const all = getAllPredictions().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function replaceAllPredictions(predictions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}
