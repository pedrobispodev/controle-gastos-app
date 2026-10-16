import { CATEGORIES, CATEGORY_COLORS } from './categories.js';

let categoryChartInstance = null;
let barChartInstance = null;

export function initCharts() {
  const catCtx = document.getElementById('categoryChart').getContext('2d');
  categoryChartInstance = new Chart(catCtx, {
    type: 'doughnut',
    data: {
      labels: CATEGORIES,
      datasets: [{
        data: CATEGORIES.map(() => 0),
        backgroundColor: CATEGORIES.map(c => CATEGORY_COLORS[c]),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });

  const barCtx = document.getElementById('barChart').getContext('2d');
  barChartInstance = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Gastos (R$)',
        data: [],
        backgroundColor: '#6366f1',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

export function updateCharts(transactions, period = 'day') {
  if (!categoryChartInstance || !barChartInstance) return;

  // Filtrar apenas despesas para os gráficos
  const expenses = transactions.filter(t => t.amount < 0);

  // 1. Atualizar Rosca por Categoria
  const catTotals = {};
  CATEGORIES.forEach(c => catTotals[c] = 0);
  expenses.forEach(t => {
    const cat = t.category || 'Outros';
    catTotals[cat] = (catTotals[cat] || 0) + Math.abs(t.amount);
  });

  categoryChartInstance.data.datasets[0].data = CATEGORIES.map(c => catTotals[c]);
  categoryChartInstance.update();

  // 2. Atualizar Barras por Período (Dia ou Mês)
  const periodTotals = {};
  expenses.forEach(t => {
    let key = t.dateISO; // YYYY-MM-DD
    if (period === 'month') {
      key = t.dateISO.substring(0, 7); // YYYY-MM
    }
    periodTotals[key] = (periodTotals[key] || 0) + Math.abs(t.amount);
  });

  const sortedKeys = Object.keys(periodTotals).sort();
  const labels = sortedKeys.map(k => {
    if (period === 'month') {
      const [y, m] = k.split('-');
      return `${m}/${y}`;
    } else {
      const [y, m, d] = k.split('-');
      return `${d}/${m}`;
    }
  });
  const dataValues = sortedKeys.map(k => periodTotals[k]);

  barChartInstance.data.labels = labels;
  barChartInstance.data.datasets[0].data = dataValues;
  barChartInstance.update();
}