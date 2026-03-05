import { computePosteriorChain, likelihoodRatio } from './bayes.js';

const BG = '#0d0c0a';
const BG_CARD = '#13120f';
const BORDER = '#2a2520';
const TEXT = '#e8dcc8';
const TEXT_SEC = '#a0916f';
const TEXT_MUTED = '#6b5d45';
const GOLD = '#c8a44e';
const GOLD_DIM = '#a07e2e';
const BLUE = '#4e79a7';
const SPICE = '#d4763a';
const MONO = '"JetBrains Mono", monospace';
const SANS = '"Inter", sans-serif';

export function exportPredictionPNG(prediction) {
  const chain = computePosteriorChain(prediction.prior, prediction.evidence);
  const posterior = chain[chain.length - 1];
  const pad = 40;
  const width = 800;

  // Measure heights
  const headerH = 90;
  const chartH = prediction.evidence.length > 0 ? 240 : 0;
  const chartGap = prediction.evidence.length > 0 ? 30 : 0;
  const rowH = 28;
  const tableHeaderH = prediction.evidence.length > 0 ? 40 : 0;
  const tableH = prediction.evidence.length > 0
    ? tableHeaderH + prediction.evidence.length * rowH + 20
    : 0;
  const watermarkH = 50;
  const totalH = pad + headerH + chartGap + chartH + chartGap + tableH + watermarkH + pad;

  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = totalH * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = totalH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, totalH);

  let y = pad;

  // ── Header ──
  // Name
  ctx.font = `400 18px ${MONO}`;
  ctx.fillStyle = TEXT;
  ctx.textBaseline = 'top';
  ctx.fillText(prediction.name, pad, y);

  // Date
  ctx.font = `400 11px ${MONO}`;
  ctx.fillStyle = BORDER;
  ctx.fillText(new Date(prediction.createdAt).toLocaleDateString(), pad, y + 28);

  // Posterior (right-aligned)
  ctx.textAlign = 'right';
  ctx.font = `500 36px ${MONO}`;
  ctx.fillStyle = TEXT;
  ctx.fillText(`${(posterior * 100).toFixed(1)}%`, width - pad, y);
  ctx.font = `400 10px ${MONO}`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textTransform = 'uppercase';
  ctx.fillText('POSTERIOR', width - pad, y + 42);

  // Prior
  ctx.font = `500 16px ${MONO}`;
  ctx.fillStyle = TEXT_SEC;
  ctx.fillText(`${(prediction.prior * 100).toFixed(1)}%`, width - pad, y + 60);
  ctx.font = `400 10px ${MONO}`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('PRIOR', width - pad, y + 78);

  ctx.textAlign = 'left';
  y += headerH;

  // ── Divider ──
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(width - pad, y);
  ctx.stroke();
  y += chartGap;

  // ── Chart ──
  if (prediction.evidence.length > 0) {
    const chartX = pad + 40;
    const chartW = width - pad * 2 - 50;
    const chartY = y + 20;
    const chartInnerH = chartH - 40;

    // Section label
    ctx.font = `500 10px ${MONO}`;
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('// PROBABILITY EVOLUTION', pad, y);

    // Y-axis labels + grid
    for (let tick = 0; tick <= 1; tick += 0.25) {
      const py = chartY + chartInnerH - tick * chartInnerH;
      ctx.font = `400 9px ${MONO}`;
      ctx.fillStyle = TEXT_MUTED;
      ctx.textAlign = 'right';
      ctx.fillText(`${(tick * 100).toFixed(0)}%`, chartX - 8, py + 3);
      ctx.textAlign = 'left';

      ctx.strokeStyle = BORDER;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(chartX, py);
      ctx.lineTo(chartX + chartW, py);
      ctx.stroke();
    }

    // Plot line
    const stepW = chain.length > 1 ? chartW / (chain.length - 1) : 0;
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    chain.forEach((val, i) => {
      const px = chartX + i * stepW;
      const py = chartY + chartInnerH - val * chartInnerH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Fill area
    ctx.fillStyle = 'rgba(78, 121, 167, 0.08)';
    ctx.beginPath();
    chain.forEach((val, i) => {
      const px = chartX + i * stepW;
      const py = chartY + chartInnerH - val * chartInnerH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.lineTo(chartX + (chain.length - 1) * stepW, chartY + chartInnerH);
    ctx.lineTo(chartX, chartY + chartInnerH);
    ctx.closePath();
    ctx.fill();

    // Points
    chain.forEach((val, i) => {
      const px = chartX + i * stepW;
      const py = chartY + chartInnerH - val * chartInnerH;
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // X-axis labels
    chain.forEach((_, i) => {
      const px = chartX + i * stepW;
      ctx.font = `400 9px ${MONO}`;
      ctx.fillStyle = TEXT_MUTED;
      ctx.textAlign = 'center';
      ctx.fillText(i === 0 ? 'Prior' : `E${i}`, px, chartY + chartInnerH + 14);
    });
    ctx.textAlign = 'left';

    y += chartH + chartGap;
  }

  // ── Evidence table ──
  if (prediction.evidence.length > 0) {
    ctx.font = `500 10px ${MONO}`;
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('// EVIDENCE', pad, y);
    y += 20;

    const cols = [pad, pad + 30, pad + 280, pad + 370, pad + 460, pad + 540];
    const colHeaders = ['#', 'DESCRIPTION', 'P(E|H)', 'P(E|¬H)', 'LR', 'POSTERIOR'];

    // Header row bg
    ctx.fillStyle = BG_CARD;
    ctx.fillRect(pad, y, width - pad * 2, rowH);
    ctx.strokeStyle = BORDER;
    ctx.strokeRect(pad, y, width - pad * 2, rowH);

    ctx.font = `500 9px ${MONO}`;
    ctx.fillStyle = TEXT_MUTED;
    colHeaders.forEach((h, i) => {
      ctx.fillText(h, cols[i] + 8, y + 17);
    });
    y += rowH;

    // Rows
    prediction.evidence.forEach((ev, i) => {
      const lr = likelihoodRatio(ev.pEgivenH, ev.pEgivenNotH);
      ctx.fillStyle = i % 2 === 0 ? BG : BG_CARD;
      ctx.fillRect(pad, y, width - pad * 2, rowH);
      ctx.strokeStyle = BORDER;
      ctx.strokeRect(pad, y, width - pad * 2, rowH);

      ctx.font = `400 11px ${MONO}`;
      ctx.fillStyle = TEXT_SEC;
      ctx.fillText(`${i + 1}`, cols[0] + 8, y + 17);

      const desc = ev.description.length > 30 ? ev.description.slice(0, 28) + '…' : ev.description;
      ctx.fillText(desc, cols[1] + 8, y + 17);
      ctx.fillText(ev.pEgivenH.toFixed(2), cols[2] + 8, y + 17);
      ctx.fillText(ev.pEgivenNotH.toFixed(2), cols[3] + 8, y + 17);

      ctx.fillStyle = lr >= 1 ? GOLD : SPICE;
      ctx.fillText(lr === Infinity ? '∞' : lr.toFixed(2), cols[4] + 8, y + 17);

      ctx.fillStyle = TEXT_SEC;
      ctx.fillText(`${(chain[i + 1] * 100).toFixed(1)}%`, cols[5] + 8, y + 17);

      y += rowH;
    });
  }

  // ── Watermark ──
  y = totalH - pad;
  ctx.font = `300 11px ${SANS}`;
  ctx.fillStyle = GOLD_DIM;
  ctx.textAlign = 'right';
  ctx.globalAlpha = 0.5;
  ctx.fillText('MENTAT', width - pad, y);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentat-${prediction.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
