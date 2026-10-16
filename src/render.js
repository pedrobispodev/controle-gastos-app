import { CATEGORIES } from './categories.js';

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function renderCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  const current = select.value;
  select.innerHTML = '<option value="all">Todas as Categorias</option>';
  CATEGORIES.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  select.value = current;
}

export function renderSummary(filteredTransactions) {
  // Considera apenas valores negativos (gastos/débitos) para os resumos principais
  const expenses = filteredTransactions.filter(t => t.amount < 0);
  const totalExpenses = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const count = expenses.length;
  
  let maior = { amount: 0, description: '-' };
  if (expenses.length > 0) {
    maior = expenses.reduce((prev, curr) => Math.abs(curr.amount) > Math.abs(prev.amount) ? curr : prev);
  }
  const media = count > 0 ? totalExpenses / count : 0;

  document.getElementById('cardTotal').textContent = formatCurrency(totalExpenses);
  document.getElementById('cardTotalCount').textContent = `${count} débitos identificados`;
  document.getElementById('cardMaiorVal').textContent = formatCurrency(Math.abs(maior.amount));
  document.getElementById('cardMaiorDesc').textContent = maior.description;
  document.getElementById('cardMedia').textContent = formatCurrency(media);
  document.getElementById('cardTotalGeral').textContent = filteredTransactions.length;
}

export function renderTable(filteredTransactions) {
  const tbody = document.getElementById('tableBody');
  if (!filteredTransactions.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-400">Nenhuma transação encontrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredTransactions.map(t => {
    const isExpense = t.amount < 0;
    const badgeClass = isExpense ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600';
    const formattedDate = t.dateISO.split('-').reverse().join('/');

    const categoryOptions = CATEGORIES.map(cat => 
      `<option value="${cat}" ${t.category === cat ? 'selected' : ''}>${cat}</option>`
    ).join('');

    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="p-3 text-slate-600 whitespace-nowrap">${escapeHtml(formattedDate)}</td>
        <td class="p-3 font-medium text-slate-800 max-w-xs truncate">${escapeHtml(t.description)}</td>
        <td class="p-3">
          <select data-id="${t.id}" class="category-select bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            ${categoryOptions}
          </select>
        </td>
        <td class="p-3 text-right font-semibold whitespace-nowrap ${isExpense ? 'text-red-600' : 'text-emerald-600'}">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-1 uppercase ${badgeClass}">${isExpense ? 'Gasto' : 'Receita'}</span>
          ${formatCurrency(t.amount)}
        </td>
      </tr>
    `;
  }).join('');
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
  toast.className = `${bg} text-white text-sm px-4 py-3 rounded-xl shadow-lg transition transform translate-y-2 opacity-0 duration-300`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}