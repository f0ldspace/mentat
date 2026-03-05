import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Apply Dune theme defaults
Chart.defaults.color = '#6b5d45';
Chart.defaults.borderColor = '#2a2520';
Chart.defaults.elements.arc.borderColor = '#6b5d45';
Chart.defaults.elements.arc.borderWidth = 2;
Chart.defaults.scale.grid.color = '#2a2520';
Chart.defaults.scale.grid.drawBorder = false;
Chart.defaults.scale.ticks.color = '#6b5d45';
Chart.defaults.plugins.legend.labels.color = '#6b5d45';

const chartInstances = new Map();

function destroyIfExists(canvasEl) {
  const existing = chartInstances.get(canvasEl);
  if (existing) {
    existing.destroy();
    chartInstances.delete(canvasEl);
  }
}

export function renderPosteriorChart(canvasEl, posteriorChain, labels) {
  destroyIfExists(canvasEl);

  const xLabels = labels || posteriorChain.map((_, i) =>
    i === 0 ? 'Prior' : `E${i}`
  );

  const chart = new Chart(canvasEl, {
    type: 'line',
    data: {
      labels: xLabels,
      datasets: [{
        label: 'P(H)',
        data: posteriorChain,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78, 121, 167, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#4e79a7',
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: {
            callback: v => (v * 100).toFixed(0) + '%',
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `P(H) = ${(ctx.parsed.y * 100).toFixed(1)}%`,
          },
        },
      },
    },
  });

  chartInstances.set(canvasEl, chart);
  return chart;
}

export function renderLikelihoodChart(canvasEl, evidenceArray) {
  destroyIfExists(canvasEl);

  const labels = evidenceArray.map((ev, i) =>
    ev.description.length > 20
      ? ev.description.slice(0, 18) + '…'
      : ev.description
  );
  const ratios = evidenceArray.map(ev =>
    ev.pEgivenNotH === 0 ? 100 : ev.pEgivenH / ev.pEgivenNotH
  );
  const colors = ratios.map(r => r >= 1 ? '#f28e2c' : '#e15759');

  const chart = new Chart(canvasEl, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Likelihood Ratio',
        data: ratios,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          ticks: {
            callback: v => v.toFixed(1),
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `LR = ${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
    },
  });

  chartInstances.set(canvasEl, chart);
  return chart;
}

export function destroyAllCharts() {
  for (const [, chart] of chartInstances) {
    chart.destroy();
  }
  chartInstances.clear();
}
