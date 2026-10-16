const STORAGE_KEY = 'controle_gastos_transactions_v1';

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Erro ao salvar no LocalStorage', e);
  }
}

export function loadTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao carregar do LocalStorage', e);
    return [];
  }
}

export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}