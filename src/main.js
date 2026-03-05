import { renderDashboard } from './views/dashboard.js';
import { renderPrediction } from './views/prediction.js';
import { renderSettings } from './views/settings.js';
import { destroyAllCharts } from './lib/charts.js';

const appEl = document.getElementById('app');
const navEl = document.getElementById('nav');

function renderNav() {
  const hash = location.hash || '#/';
  navEl.innerHTML = `
    <a href="#/" class="nav-title">Mentat</a>
    <a href="#/" class="nav-link ${hash === '#/' || hash === '' ? 'active' : ''}">Dashboard</a>
    <a href="#/settings" class="nav-link ${hash === '#/settings' ? 'active' : ''}">Settings</a>
  `;
}

function route() {
  destroyAllCharts();
  renderNav();

  const hash = location.hash || '#/';

  if (hash === '#/' || hash === '') {
    renderDashboard(appEl);
  } else if (hash.startsWith('#/prediction/')) {
    const id = hash.replace('#/prediction/', '');
    renderPrediction(appEl, id);
  } else if (hash === '#/settings') {
    renderSettings(appEl);
  } else {
    appEl.innerHTML = `<div class="empty-state">Page not found.</div>`;
  }
}

window.addEventListener('hashchange', route);
route();
