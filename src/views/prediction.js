import { getPrediction, savePrediction, deletePrediction } from '../lib/storage.js';
import { computePosterior, computePosteriorChain, likelihoodRatio } from '../lib/bayes.js';
import { renderPosteriorChart, destroyAllCharts } from '../lib/charts.js';
import { exportPredictionPNG } from '../lib/png-export.js';

export function renderPrediction(appEl, id) {
  const pred = getPrediction(id);
  if (!pred) {
    appEl.innerHTML = `<div class="empty-state">Prediction not found.</div>`;
    return;
  }

  const chain = computePosteriorChain(pred.prior, pred.evidence);
  const posterior = chain[chain.length - 1];
  const delta = posterior - pred.prior;
  const deltaSign = delta >= 0 ? '+' : '';
  const posteriorClass = posterior >= 0.7 ? 'posterior-high' : posterior <= 0.3 ? 'posterior-low' : '';

  let html = `
    <a href="#/" class="back-link">Dashboard</a>

    <div class="detail-header">
      <div>
        <h1 style="font-size:1rem; font-weight:400; font-family:var(--dune-font-mono); color:var(--dune-text); margin-bottom:0.5rem;">
          ${escapeHtml(pred.name)}
        </h1>
        <div class="timestamp">Created ${new Date(pred.createdAt).toLocaleString()}</div>
      </div>
      <div class="detail-stats">
        <div class="stat-group stat-large">
          <span class="stat-value ${posteriorClass}">${(posterior * 100).toFixed(1)}%</span>
          <span class="stat-label">posterior</span>
        </div>
        <div class="stat-group">
          <span class="stat-value">${(pred.prior * 100).toFixed(1)}%</span>
          <span class="stat-label">prior</span>
        </div>
        ${pred.evidence.length > 0 ? `
          <div class="stat-group">
            <span class="stat-value" style="color:${delta >= 0 ? 'var(--dune-gold)' : 'var(--dune-spice)'}">${deltaSign}${(delta * 100).toFixed(1)}pp</span>
            <span class="stat-label">shift</span>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Add evidence form -->
    <h3 class="section-header">Add Evidence</h3>
    <form id="add-evidence-form" class="evidence-form mb-3">
      <div class="form-group">
        <label class="form-label" for="ev-desc">Description</label>
        <input class="form-input" type="text" id="ev-desc" placeholder="What evidence did you observe?" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="ev-h">P(E|H) — if true, how likely is this evidence?</label>
          <div class="slider-input-row">
            <input type="range" id="ev-h-range" min="0.01" max="0.99" step="0.01" value="0.7" />
            <input class="form-input form-input-sm" type="number" id="ev-h" min="0.01" max="0.99" step="0.01" value="0.7" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="ev-nh">P(E|¬H) — if false, how likely is this evidence?</label>
          <div class="slider-input-row">
            <input type="range" id="ev-nh-range" min="0.01" max="0.99" step="0.01" value="0.3" />
            <input class="form-input form-input-sm" type="number" id="ev-nh" min="0.01" max="0.99" step="0.01" value="0.3" required />
          </div>
        </div>
      </div>
      <div class="evidence-preview" id="evidence-preview">
        <div class="stat-group">
          <span class="stat-value" id="preview-posterior">--</span>
          <span class="stat-label">new posterior</span>
        </div>
        <div class="stat-group">
          <span class="stat-value" id="preview-lr">--</span>
          <span class="stat-label">likelihood ratio</span>
        </div>
        <div class="stat-group">
          <span class="stat-value" id="preview-delta">--</span>
          <span class="stat-label">change</span>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Add Evidence</button>
    </form>

    <!-- Charts -->
    ${pred.evidence.length > 0 ? `
      <h3 class="section-header">Probability Evolution</h3>
      <div class="chart-container">
        <canvas id="posterior-chart"></canvas>
      </div>
    ` : ''}

    <!-- Evidence table -->
    <h3 class="section-header">Evidence (${pred.evidence.length})</h3>
    ${pred.evidence.length > 0 ? `
      <div class="mb-3" style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>P(E|H)</th>
              <th>P(E|¬H)</th>
              <th>LR</th>
              <th>Posterior</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${pred.evidence.map((ev, i) => {
              const lr = likelihoodRatio(ev.pEgivenH, ev.pEgivenNotH);
              const evDate = ev.addedAt ? new Date(ev.addedAt).toLocaleDateString() : '';
              return `
                <tr>
                  <td>${i + 1}</td>
                  <td>
                    ${escapeHtml(ev.description)}
                    ${evDate ? `<span class="timestamp" style="display:block; margin-top:2px;">${evDate}</span>` : ''}
                  </td>
                  <td>${ev.pEgivenH.toFixed(2)}</td>
                  <td>${ev.pEgivenNotH.toFixed(2)}</td>
                  <td style="color:${lr >= 1 ? 'var(--dune-gold)' : 'var(--dune-spice)'}">
                    ${lr === Infinity ? '∞' : lr.toFixed(2)}
                  </td>
                  <td>${(chain[i + 1] * 100).toFixed(1)}%</td>
                  <td>
                    <button class="btn btn-danger remove-ev-btn" data-idx="${i}" style="padding:0.25rem 0.5rem; font-size:0.5rem;">×</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="empty-state mb-3">
        <p>No evidence added yet.</p>
        <p style="margin-top:0.5rem; color:var(--dune-border-strong); font-size:0.6rem;">
          Add evidence above to update your belief.
          Each piece of evidence shifts the posterior via Bayes' theorem.
        </p>
      </div>
    `}

    <!-- Actions -->
    <div class="mt-4 btn-row">
      <button class="btn" id="export-png-btn">Export PNG</button>
      <button class="btn btn-danger" id="delete-pred-btn">Delete Prediction</button>
    </div>
  `;

  appEl.innerHTML = html;

  // ── Slider ↔ input sync + live preview ──
  const hRange = appEl.querySelector('#ev-h-range');
  const hInput = appEl.querySelector('#ev-h');
  const nhRange = appEl.querySelector('#ev-nh-range');
  const nhInput = appEl.querySelector('#ev-nh');

  function syncAndPreview() {
    const pEH = parseFloat(hInput.value);
    const pENH = parseFloat(nhInput.value);
    const previewPosterior = appEl.querySelector('#preview-posterior');
    const previewLR = appEl.querySelector('#preview-lr');
    const previewDelta = appEl.querySelector('#preview-delta');

    if (isNaN(pEH) || isNaN(pENH) || pEH <= 0 || pEH >= 1 || pENH <= 0 || pENH >= 1) {
      previewPosterior.textContent = '--';
      previewLR.textContent = '--';
      previewDelta.textContent = '--';
      return;
    }

    const newPost = computePosterior(posterior, pEH, pENH);
    const lr = likelihoodRatio(pEH, pENH);
    const d = newPost - posterior;
    const dSign = d >= 0 ? '+' : '';

    previewPosterior.textContent = `${(newPost * 100).toFixed(1)}%`;
    previewPosterior.style.color = newPost >= 0.7 ? 'var(--dune-gold-bright)' : newPost <= 0.3 ? 'var(--dune-spice)' : '';
    previewLR.textContent = lr === Infinity ? '∞' : lr.toFixed(2);
    previewLR.style.color = lr >= 1 ? 'var(--dune-gold)' : 'var(--dune-spice)';
    previewDelta.textContent = `${dSign}${(d * 100).toFixed(1)}pp`;
    previewDelta.style.color = d >= 0 ? 'var(--dune-gold)' : 'var(--dune-spice)';
  }

  hRange.addEventListener('input', () => { hInput.value = hRange.value; syncAndPreview(); });
  hInput.addEventListener('input', () => { hRange.value = hInput.value; syncAndPreview(); });
  nhRange.addEventListener('input', () => { nhInput.value = nhRange.value; syncAndPreview(); });
  nhInput.addEventListener('input', () => { nhRange.value = nhInput.value; syncAndPreview(); });

  // Initial preview
  syncAndPreview();

  // Render charts
  if (pred.evidence.length > 0) {
    const posteriorCanvas = appEl.querySelector('#posterior-chart');
    renderPosteriorChart(posteriorCanvas, chain);
  }

  // Add evidence
  appEl.querySelector('#add-evidence-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = appEl.querySelector('#ev-desc').value.trim();
    const pEgivenH = parseFloat(hInput.value);
    const pEgivenNotH = parseFloat(nhInput.value);

    if (!desc || isNaN(pEgivenH) || isNaN(pEgivenNotH)) return;
    if (pEgivenH <= 0 || pEgivenH >= 1 || pEgivenNotH <= 0 || pEgivenNotH >= 1) return;

    pred.evidence.push({
      description: desc,
      pEgivenH,
      pEgivenNotH,
      addedAt: Date.now(),
    });
    savePrediction(pred);
    destroyAllCharts();
    renderPrediction(appEl, id);
  });

  // Remove evidence
  appEl.querySelectorAll('.remove-ev-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      pred.evidence.splice(idx, 1);
      savePrediction(pred);
      destroyAllCharts();
      renderPrediction(appEl, id);
    });
  });

  // Export PNG
  appEl.querySelector('#export-png-btn').addEventListener('click', () => {
    exportPredictionPNG(pred);
  });

  // Delete prediction
  appEl.querySelector('#delete-pred-btn').addEventListener('click', () => {
    showConfirm('Delete this prediction? This cannot be undone.', () => {
      destroyAllCharts();
      deletePrediction(id);
      location.hash = '#/';
    });
  });
}

function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-box">
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn" id="confirm-cancel">Cancel</button>
        <button class="btn btn-danger" id="confirm-ok">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#confirm-ok').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
