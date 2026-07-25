const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/scraped_products.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Regex to detect variant suffixes like (A1), (2), (OA2), 3ml, Kit, etc.
// But we want to be careful not to strip everything.
// Pattern matches: " (A1)", " (2)", " (OA2)", " Kit" etc at the end or before a comma.
// Actually, many names are like "Filtek Z250 (A1) 3М, Китай" or "Nexcomp Flow (A1) Meta Biomed, Южная Корея"

function extractBaseNameAndVariant(name) {
  // Let's look for text in parentheses
  const parenMatch = name.match(/ \(([^)]+)\)/);
  if (parenMatch) {
    const variant = parenMatch[1];
    const baseName = name.replace(parenMatch[0], '');
    return { baseName, variant };
  }
  return { baseName: name, variant: 'Стандарт' };
}

const grouped = new Map();

for (const p of data) {
  const { baseName, variant } = extractBaseNameAndVariant(p.name);
  
  if (!grouped.has(baseName)) {
    // Clone product
    const newProduct = { ...p, name: baseName, modifications: [] };
    // Keep first price as default
    const defaultPrice = p.modifications && p.modifications[0] && p.modifications[0].prices ? p.modifications[0].prices[0] : { currency_price: 0, currency: 'KZT' };
    
    newProduct.modifications.push({
      id: newProduct.modifications.length + 1,
      name: variant,
      prices: [defaultPrice]
    });
    
    grouped.set(baseName, newProduct);
  } else {
    // Add modification
    const existing = grouped.get(baseName);
    const defaultPrice = p.modifications && p.modifications[0] && p.modifications[0].prices ? p.modifications[0].prices[0] : { currency_price: 0, currency: 'KZT' };
    
    // Only add if not duplicate variant
    if (!existing.modifications.find(m => m.name === variant)) {
      existing.modifications.push({
        id: existing.modifications.length + 1,
        name: variant,
        prices: [defaultPrice]
      });
    }
  }
}

// Re-assign IDs sequentially
const result = Array.from(grouped.values()).map((p, index) => {
  p.id = index + 1;
  return p;
});

fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`Processed ${data.length} products -> ${result.length} grouped products.`);
