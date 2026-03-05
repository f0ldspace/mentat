import { encrypt, decrypt } from './crypto.js';
import { likelihoodRatio, computePosteriorChain } from './bayes.js';

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJSON(predictions) {
  const json = JSON.stringify(predictions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  download(blob, `mentat-export-${Date.now()}.json`);
}

export function exportCSV(predictions) {
  const headers = [
    'prediction_id', 'prediction_name', 'prior',
    'evidence_index', 'evidence_description',
    'p_e_given_h', 'p_e_given_not_h', 'likelihood_ratio',
    'posterior_after', 'created_at',
  ];
  const rows = [headers.join(',')];

  for (const pred of predictions) {
    const chain = computePosteriorChain(pred.prior, pred.evidence);
    if (pred.evidence.length === 0) {
      rows.push([
        pred.id, `"${pred.name.replace(/"/g, '""')}"`, pred.prior,
        '', '', '', '', '', pred.prior,
        new Date(pred.createdAt).toISOString(),
      ].join(','));
    }
    pred.evidence.forEach((ev, i) => {
      rows.push([
        pred.id, `"${pred.name.replace(/"/g, '""')}"`, pred.prior,
        i + 1, `"${ev.description.replace(/"/g, '""')}"`,
        ev.pEgivenH, ev.pEgivenNotH,
        likelihoodRatio(ev.pEgivenH, ev.pEgivenNotH),
        chain[i + 1],
        new Date(pred.createdAt).toISOString(),
      ].join(','));
    });
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  download(blob, `mentat-export-${Date.now()}.csv`);
}

export async function exportEncrypted(predictions, passphrase) {
  const encrypted = await encrypt(predictions, passphrase);
  const json = JSON.stringify(encrypted, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  download(blob, `mentat-export-${Date.now()}.enc.json`);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function importEncrypted(file, passphrase) {
  const raw = await importJSON(file);
  return decrypt(raw, passphrase);
}
