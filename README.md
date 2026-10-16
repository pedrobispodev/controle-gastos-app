# Controle de Gastos Pessoais via CSV

Aplicação web desenvolvida para análise inteligente de extratos bancários em formato CSV diretamente no navegador, utilizando JavaScript modular (ES6+), Tailwind CSS, Chart.js e PapaParse.

## Funcionalidades
- **Upload via Drag & Drop** de extratos CSV bancários (Nubank, Itaú, etc.).
- **Categorização Automática** por regras de palavras-chave (Alimentação, Transporte, Lazer, Saúde, Moradia, Outros).
- **Dashboard Resumo** com total de débitos, maior gasto e média por transação.
- **Gráficos Interativos** (Rosca por categoria e Barras temporais por dia/mês).
- **Filtros e Edição Manual** de categorias diretamente na tabela.
- **Persistência Local** via `LocalStorage`.