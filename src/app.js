import { parseCSV } from './parser.js';
import { categorize } from './categories.js';
import { renderSummary, renderTable, renderCategoryFilter, showToast } from './render.js';
import { initCharts, updateCharts } from './charts.js';
import { saveTransactions, loadTransactions, clearTransactions } from './storage.js';

const state = {
  transactions: [],
  filter: { search: '', category: 'all', period: 'day' }
};

const els = {
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('fileInput'),
  btnClear: document.getElementById('btnClear'),
  btnExport: document.getElementById('btnExport'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  periodDay: document.getElementById('periodDay'),
  periodMonth: document.getElementById('periodMonth'),
  tableBody: document.getElementById('tableBody')
};

function init() {
  renderCategoryFilter();
  initCharts();
  bindEvents();

  const saved = loadTransactions();
  if (saved.length) {
    state.transactions = saved;
    renderAll();
  }
}

function bindEvents() {
  els.dropzone.addEventListener('dragover', e => { e.preventDefault(); els.dropzone.classList.add('border-indigo-500', 'bg-indigo-50/50'); });
  els.dropzone.addEventListener('dragleave', () => els.dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/50'));
  els.dropzone.addEventListener('drop', e => {
    e.preventDefault();
    els.dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  els.dropzone.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  els.searchInput.addEventListener('input', e => {
    state.filter.search = e.target.value;
    renderAll();
  });

  els.categoryFilter.addEventListener('change', e => {
    state.filter.category = e.target.value;
    renderAll();
  });

  els.periodDay.addEventListener('click', () => setPeriod('day'));
  els.periodMonth.addEventListener('click', () => setPeriod('month'));

  els.btnClear.addEventListener('click', () => {
    if (confirm('Deseja limpar todos os dados salvos?')) {
      clearTransactions();
      state.transactions = [];
      renderAll();
      showToast('Dados limpos com sucesso!', 'success');
    }
  });

  els.btnExport.addEventListener('click', exportCSV);

  // Delegação de evento para mudança manual de categoria na tabela
  els.tableBody.addEventListener('change', e => {
    if (e.target.matches('.category-select')) {
      const id = e.target.getAttribute('data-id');
      const newCategory = e.target.value;
      const txn = state.transactions.find(t => t.id === id);
      if (txn) {
        txn.category = newCategory;
        saveTransactions(state.transactions);
        renderAll();
        showToast('Categoria atualizada!', 'success');
      }
    }
  });
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const rows = parseCSV(e.target.result);
      if (!rows.length) {
        showToast('Nenhuma transação válida encontrada no arquivo.', 'error');
        return;
      }
      rows.forEach(t => {
        if (!t.category) t.category = categorize(t.description);
      });
      state.transactions = rows;
      saveTransactions(rows);
      renderCategoryFilter();
      renderAll();
      showToast(`${rows.length} transações importadas com sucesso!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar arquivo CSV.', 'error');
    }
  };
  reader.onerror = () => showToast('Erro ao ler o arquivo.', 'error');
  reader.readAsText(file);
}

function setPeriod(period) {
  state.filter.period = period;
  if (period === 'day') {
    els.periodDay.className = 'px-3 py-1 text-xs font-medium rounded-md bg-white text-indigo-600 shadow-sm transition';
    els.periodMonth.className = 'px-3 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 transition';
  } else {
    els.periodMonth.className = 'px-3 py-1 text-xs font-medium rounded-md bg-white text-indigo-600 shadow-sm transition';
    els.periodDay.className = 'px-3 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 transition';
  }
  updateCharts(getFiltered(), state.filter.period);
}

function getFiltered() {
  const { search, category } = state.filter;
  const term = search.trim().toLowerCase();
  return state.transactions.filter(t => {
    const matchCategory = category === 'all' || t.category === category;
    const matchSearch = !term || t.description.toLowerCase().includes(term) || String(t.dateOriginal).toLowerCase().includes(term);
    return matchCategory && matchSearch;
  });
}

function renderAll() {
  const filtered = getFiltered();
  renderSummary(filtered);
  renderTable(filtered);
  updateCharts(filtered, state.filter.period);
}

function exportCSV() {
  if (!state.transactions.length) {
    showToast('Não há dados para exportar.', 'error');
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Data;Descricao;Categoria;Valor\n";
  state.transactions.forEach(t => {
    csvContent += `${t.dateISO};"${t.description.replace(/"/g, '""')}";${t.category};${t.amount}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'gastos_categorizados.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Arquivo exportado com sucesso!', 'success');
}

document.addEventListener('DOMContentLoaded', init);