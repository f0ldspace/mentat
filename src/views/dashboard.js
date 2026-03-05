import { getAllPredictions, savePrediction } from '../lib/storage.js';
import { computePosteriorChain } from '../lib/bayes.js';

export function renderDashboard(appEl) {
  const predictions = getAllPredictions()
    .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

  let html = '';

  if (predictions.length === 0) {
    html += `
      <div class="empty-state">
        <p style="font-size:0.85rem; color:var(--dune-text); margin-bottom:0.75rem;">Mentat</p>
        <p>Bayesian probability calculator.</p>
        <p style="margin-top:0.5rem; color:var(--dune-border-strong); font-size:0.6rem; max-width:360px; margin-left:auto; margin-right:auto; line-height:1.8;">
          Create a prediction, set your prior belief, then add evidence
          to watch the posterior update via Bayes' theorem.
        </p>
        <div class="mt-3">
          <button class="btn btn-primary" id="new-prediction-btn">+ New Prediction</button>
        </div>
      </div>
    `;
  } else {
    html += `<h2 class="section-header">Predictions</h2>`;
    html += `<div class="grid">`;
    for (const pred of predictions) {
      const chain = computePosteriorChain(pred.prior, pred.evidence);
      const posterior = chain[chain.length - 1];
      const date = new Date(pred.updatedAt || pred.createdAt).toLocaleDateString();
      const posteriorClass = posterior >= 0.7 ? 'posterior-high' : posterior <= 0.3 ? 'posterior-low' : '';
      html += `
        <div class="card" data-id="${pred.id}">
          <div class="card-header">${escapeHtml(pred.name)}</div>
          <div class="card-meta">
            <div class="stat-group">
              <span class="stat-value ${posteriorClass}">${(posterior * 100).toFixed(1)}%</span>
              <span class="stat-label">posterior</span>
            </div>
            <div class="stat-group">
              <span class="stat-value">${(pred.prior * 100).toFixed(1)}%</span>
              <span class="stat-label">prior</span>
            </div>
            <div class="stat-group">
              <span class="stat-value">${pred.evidence.length}</span>
              <span class="stat-label">evidence</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="timestamp">${date}</span>
            ${pred.evidence.length > 0 ? `<span class="tag">${posterior >= 0.8 ? 'likely' : posterior <= 0.2 ? 'unlikely' : 'uncertain'}</span>` : ''}
          </div>
        </div>
      `;
    }
    html += `</div>`;

    html += `
      <div class="mt-3">
        <button class="btn btn-primary" id="new-prediction-btn">+ New Prediction</button>
      </div>
    `;
  }

  appEl.innerHTML = html;

  // Card click handlers
  appEl.querySelectorAll('.card[data-id]').forEach(card => {
    card.addEventListener('click', () => {
      location.hash = `#/prediction/${card.dataset.id}`;
    });
  });

  // New prediction
  appEl.querySelector('#new-prediction-btn').addEventListener('click', () => {
    showNewPredictionForm(appEl);
  });
}

function showNewPredictionForm(appEl) {
  const formHtml = `
    <a href="#/" class="back-link">Dashboard</a>
    <h2 class="section-header mb-3">New Prediction</h2>
    <form id="new-prediction-form">
      <div class="form-group">
        <label class="form-label" for="pred-name">Prediction name</label>
        <input class="form-input" type="text" id="pred-name" placeholder="Will X happen?" required autofocus />
      </div>
      <div class="form-group">
        <label class="form-label" for="pred-prior">Prior probability</label>
        <div class="slider-input-row">
          <input type="range" id="pred-prior-range" min="0.01" max="0.99" step="0.01" value="0.5" />
          <input class="form-input form-input-sm" type="number" id="pred-prior" min="0.01" max="0.99" step="0.01" value="0.5" />
        </div>
        <div class="prior-hint mt-2">
          <span id="prior-pct" class="stat-value" style="font-size:1.2rem;">50.0%</span>
        </div>
      </div>
      <div class="btn-row">
        <button type="submit" class="btn btn-primary">Create</button>
        <button type="button" class="btn" id="cancel-btn">Cancel</button>
      </div>
    </form>
  `;
  appEl.innerHTML = formHtml;

  const rangeEl = appEl.querySelector('#pred-prior-range');
  const numberEl = appEl.querySelector('#pred-prior');
  const pctEl = appEl.querySelector('#prior-pct');

  function syncPrior() {
    pctEl.textContent = `${(parseFloat(numberEl.value) * 100).toFixed(1)}%`;
  }

  rangeEl.addEventListener('input', () => { numberEl.value = rangeEl.value; syncPrior(); });
  numberEl.addEventListener('input', () => { rangeEl.value = numberEl.value; syncPrior(); });

  appEl.querySelector('#cancel-btn').addEventListener('click', () => {
    location.hash = '#/';
  });

  appEl.querySelector('#new-prediction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = appEl.querySelector('#pred-name').value.trim();
    const prior = parseFloat(numberEl.value);
    if (!name || isNaN(prior) || prior <= 0 || prior >= 1) return;

    const pred = savePrediction({
      id: crypto.randomUUID(),
      name,
      prior,
      evidence: [],
    });
    location.hash = `#/prediction/${pred.id}`;
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
