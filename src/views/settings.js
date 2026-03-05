import { getAllPredictions, replaceAllPredictions } from '../lib/storage.js';
import { exportJSON, exportCSV, exportEncrypted, importJSON, importEncrypted } from '../lib/export.js';

export function renderSettings(appEl) {
  const predictions = getAllPredictions();

  const html = `
    <h2 class="section-header mb-3">Settings</h2>

    <!-- Export -->
    <div class="settings-section">
      <h3 class="section-header">Export Data</h3>
      <p class="mb-2" style="font-size:0.75rem;">${predictions.length} prediction${predictions.length !== 1 ? 's' : ''} stored.</p>
      <div class="btn-row mb-2">
        <button class="btn" id="export-json-btn" ${predictions.length === 0 ? 'disabled' : ''}>Export JSON</button>
        <button class="btn" id="export-csv-btn" ${predictions.length === 0 ? 'disabled' : ''}>Export CSV</button>
      </div>
      <div class="form-group">
        <label class="form-label" for="export-pass">Passphrase (for encrypted export)</label>
        <input class="form-input" type="password" id="export-pass" placeholder="Enter passphrase" style="max-width:300px" />
      </div>
      <button class="btn btn-primary" id="export-enc-btn" ${predictions.length === 0 ? 'disabled' : ''}>Export Encrypted</button>
    </div>

    <!-- Import -->
    <div class="settings-section">
      <h3 class="section-header">Import Data</h3>
      <div class="form-group">
        <label class="form-label">Select file (.json or .enc.json)</label>
        <div class="file-input-wrap">
          <button class="btn" id="import-file-btn">Choose File</button>
          <input type="file" id="import-file" accept=".json" />
        </div>
        <span id="import-filename" class="timestamp mt-2" style="display:block"></span>
      </div>
      <div class="form-group" id="import-pass-group" style="display:none">
        <label class="form-label" for="import-pass">Decryption passphrase</label>
        <input class="form-input" type="password" id="import-pass" placeholder="Enter passphrase" style="max-width:300px" />
      </div>
      <div class="form-group">
        <label class="form-label">Import mode</label>
        <div class="btn-row">
          <label class="radio-label">
            <input type="radio" name="import-mode" value="replace" checked /> Replace all
          </label>
          <label class="radio-label">
            <input type="radio" name="import-mode" value="append" /> Append to existing
          </label>
        </div>
      </div>
      <button class="btn btn-primary" id="import-btn" disabled>Import</button>
      <div id="import-status" class="mt-2 timestamp"></div>
    </div>

    <!-- Danger Zone -->
    <div class="settings-section" style="border-color: var(--dune-error);">
      <h3 class="section-header">Danger Zone</h3>
      <p class="mb-2" style="font-size:0.75rem;">Permanently delete all predictions and evidence.</p>
      <button class="btn btn-danger" id="clear-all-btn" ${predictions.length === 0 ? 'disabled' : ''}>Clear All Data</button>
    </div>
  `;

  appEl.innerHTML = html;

  // Export JSON
  appEl.querySelector('#export-json-btn').addEventListener('click', () => {
    exportJSON(predictions);
  });

  // Export CSV
  appEl.querySelector('#export-csv-btn').addEventListener('click', () => {
    exportCSV(predictions);
  });

  // Export Encrypted
  appEl.querySelector('#export-enc-btn').addEventListener('click', async () => {
    const pass = appEl.querySelector('#export-pass').value;
    if (!pass) {
      appEl.querySelector('#export-pass').focus();
      return;
    }
    await exportEncrypted(predictions, pass);
  });

  // File input trigger
  const fileInput = appEl.querySelector('#import-file');
  appEl.querySelector('#import-file-btn').addEventListener('click', () => {
    fileInput.click();
  });

  let selectedFile = null;
  fileInput.addEventListener('change', () => {
    selectedFile = fileInput.files[0];
    if (!selectedFile) return;
    appEl.querySelector('#import-filename').textContent = selectedFile.name;
    appEl.querySelector('#import-btn').disabled = false;

    const isEncrypted = selectedFile.name.endsWith('.enc.json');
    appEl.querySelector('#import-pass-group').style.display = isEncrypted ? 'block' : 'none';
  });

  // Import
  appEl.querySelector('#import-btn').addEventListener('click', async () => {
    if (!selectedFile) return;
    const statusEl = appEl.querySelector('#import-status');
    const mode = appEl.querySelector('input[name="import-mode"]:checked').value;

    try {
      let imported;
      if (selectedFile.name.endsWith('.enc.json')) {
        const pass = appEl.querySelector('#import-pass').value;
        if (!pass) {
          appEl.querySelector('#import-pass').focus();
          return;
        }
        imported = await importEncrypted(selectedFile, pass);
      } else {
        imported = await importJSON(selectedFile);
      }

      if (!Array.isArray(imported)) {
        statusEl.textContent = 'Error: file does not contain a valid predictions array.';
        statusEl.style.color = 'var(--dune-error)';
        return;
      }

      if (mode === 'append') {
        const existing = getAllPredictions();
        const existingIds = new Set(existing.map(p => p.id));
        const newPreds = imported.filter(p => !existingIds.has(p.id));
        replaceAllPredictions([...existing, ...newPreds]);
        statusEl.textContent = `Appended ${newPreds.length} new prediction${newPreds.length !== 1 ? 's' : ''} (${imported.length - newPreds.length} duplicates skipped).`;
      } else {
        replaceAllPredictions(imported);
        statusEl.textContent = `Replaced with ${imported.length} prediction${imported.length !== 1 ? 's' : ''}.`;
      }
      statusEl.style.color = 'var(--dune-gold)';
    } catch (err) {
      statusEl.textContent = `Error: ${err.message}`;
      statusEl.style.color = 'var(--dune-error)';
    }
  });

  // Clear all
  appEl.querySelector('#clear-all-btn').addEventListener('click', () => {
    showConfirm('Delete all predictions? This cannot be undone.', () => {
      replaceAllPredictions([]);
      renderSettings(appEl);
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
        <button class="btn btn-danger" id="confirm-ok">Confirm</button>
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
