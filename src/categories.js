export const CATEGORIES = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Moradia', 'Outros'];

export const CATEGORY_COLORS = {
  'Alimentação': '#f59e0b', // Amber
  'Transporte': '#3b82f6',  // Blue
  'Lazer': '#ec4899',       // Pink
  'Saúde': '#ef4444',       // Red
  'Moradia': '#8b5cf6',     // Violet
  'Outros': '#6b7280'       // Gray
};

const KEYWORDS = {
  'Alimentação': ['ifood', 'restaurante', 'lanchonete', 'padaria', 'mercado', 'supermercado', 'burger', 'pizza', 'açaí', 'cafe', 'cafeteria', 'mcdonald', 'subway', 'bakery', 'food', 'lanches', 'bar', 'churrascaria', 'marmita', 'delivery', 'carrefour', 'paodeacucar', 'assai', 'atacadao'],
  'Transporte': ['uber', 'taxi', 'cabify', 'metrô', 'metro', 'ônibus', 'onibus', '99', '99app', 'combustivel', 'gasolina', 'posto', 'estacionamento', 'pedagio', 'ipva'],
  'Lazer': ['cinema', 'streaming', 'netflix', 'spotify', 'youtube', 'hbo', 'prime', 'steam', 'playstation', 'xbox', 'show', 'jogo', 'game', 'teatro', 'parque', 'turismo', 'hotel', 'viagem', 'livros', 'livraria', 'disney'],
  'Saúde': ['farmacia', 'drogaria', 'hospital', 'medico', 'dentista', 'consulta', 'exame', 'saude', 'laboratorio', 'remedio', 'drogasil', 'pacheco'],
  'Moradia': ['aluguel', 'condominio', 'luz', 'agua', 'energia', 'cpfl', 'cemig', 'sabesp', 'internet', 'telefone', 'vivo', 'claro', 'tim', 'gas', 'iptu', 'manutencao']
};

export function categorize(description) {
  if (!description) return 'Outros';
  const desc = description.toLowerCase();
  for (const [category, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      if (desc.includes(word)) {
        return category;
      }
    }
  }
  return 'Outros';
}