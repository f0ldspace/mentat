/*
 * Dune Theme - Chart.js Defaults
 *
 * Apply before creating any charts.
 * Requires Chart.js 4.x loaded.
 */

Chart.defaults.color = '#6b5d45';
Chart.defaults.borderColor = '#2a2520';

// Pie / doughnut segment borders
Chart.defaults.elements.arc.borderColor = '#6b5d45';
Chart.defaults.elements.arc.borderWidth = 2;

// Axis grid lines
Chart.defaults.scale.grid.color = '#2a2520';
Chart.defaults.scale.grid.drawBorder = false;

// Axis tick labels
Chart.defaults.scale.ticks.color = '#6b5d45';

// Legend text
Chart.defaults.plugins.legend.labels.color = '#6b5d45';

/*
 * Recommended data palette (8 colors):
 *
 * const DUNE_PALETTE = [
 *   '#4e79a7',  // steel blue
 *   '#f28e2c',  // amber
 *   '#e15759',  // coral red
 *   '#76b7b2',  // teal
 *   '#59a14f',  // green
 *   '#edc949',  // yellow
 *   '#af7aa1',  // mauve
 *   '#ff9da7',  // pink
 * ];
 */
