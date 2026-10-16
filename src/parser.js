const Papa = window.Papa;

export function parseCSV(text) {
  const delimiter = detectDelimiter(text);
  const result = Papa.parse(text, {
    header: true,
    delimiter: delimiter,
    skipEmptyLines: 'greedy',
    transformHeader: h => h.trim().toLowerCase()
  });

  const rows = result.data;
  const parsedTransactions = [];

  rows.forEach((row, index) => {
    // Tenta encontrar colunas equivalentes independentemente do banco
    const dateKey = Object.keys(row).find(k => k.match(/data|date|dt/));
    const descKey = Object.keys(row).find(k => k.match(/desc|hist|estabelecimento|memo/));
    const amountKey = Object.keys(row).find(k => k.match(/valor|amount|montante/));
    const catKey = Object.keys(row).find(k => k.match(/categ/));

    if (!dateKey || !amountKey) return;

    const rawDate = row[dateKey];
    const rawDesc = descKey ? row[descKey] : 'Transação sem descrição';
    const rawAmount = row[amountKey];

    const amount = parseAmount(rawAmount);
    // Ignora transações zeradas
    if (amount === 0) return;

    parsedTransactions.push({
      id: `txn_${index}_${Math.random().toString(36).substr(2, 5)}`,
      dateOriginal: rawDate,
      dateISO: parseDateISO(rawDate),
      description: String(rawDesc).trim(),
      amount: amount, // Negativo = gasto, Positivo = receita
      category: catKey && row[catKey] ? row[catKey] : null
    });
  });

  return parsedTransactions;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ';' : ',';
}

function parseAmount(value) {
  if (value === null || value === undefined || value === '') return 0;
  let s = String(value).trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
  const isNegative = s.startsWith('-') || s.endsWith('-') || (s.startsWith('(') && s.endsWith(')'));
  s = s.replace(/[()]/g, '').replace(/^-|-$/g, '').trim();

  // Tratamento padrão brasileiro vs americano
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length === 2) {
      s = parts.join('.');
    } else {
      s = s.replace(/,/g, '');
    }
  }

  const num = parseFloat(s);
  const result = isNaN(num) ? 0 : num;
  return isNegative ? -Math.abs(result) : result;
}

function parseDateISO(str) {
  if (!str) return new Date().toISOString().split('T')[0];
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  
  m = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let day = m[1].padStart(2, '0');
    let month = m[2].padStart(2, '0');
    let year = m[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split('T')[0];
}