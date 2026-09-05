const fs = require('fs');
const path = require('path');

const targets = ['atelier', 'aurelia', 'minimalist', 'monument', 'noire', 'vanta'];
const templatesDir = path.join(__dirname, '..', 'app', 'templates');

for (const tmpl of targets) {
  // 1. Fix CartContext.tsx
  const cartFile = path.join(templatesDir, tmpl, 'CartContext.tsx');
  if (fs.existsSync(cartFile)) {
    let content = fs.readFileSync(cartFile, 'utf8');
    // Remove the redundant line 65/66 const __customContext = ... const basePath = ...
    content = content.replace(
      /const __customContext = useCustomizationContext\(\);\s*const basePath = typeof __customContext\?\.basePath === "string" \? __customContext\.basePath : "";\s*const \[items, setItems\]/g,
      'const [items, setItems]'
    );
    // In CartProvider, ensure basePath resolution is clean:
    content = content.replace(
      /const calculatedBasePath = [^\n;]+;\s*const basePath = [^\n;]+;/g,
      'const calculatedBasePath = isCustomStore ? `/store/${storeSlug}` : "";\n  const basePath = initialBasePath !== undefined ? initialBasePath : calculatedBasePath;'
    );
    fs.writeFileSync(cartFile, content, 'utf8');
    console.log(`Fixed CartContext for ${tmpl}`);
  }

  // 2. Fix products/[id]/page.tsx
  const prodFile = path.join(templatesDir, tmpl, 'products', '[id]', 'page.tsx');
  if (fs.existsSync(prodFile)) {
    let content = fs.readFileSync(prodFile, 'utf8');
    content = content.replace(
      /const __customContext = useCustomizationContext\(\);\s*const basePath = typeof __customContext\?\.basePath === "string" \? __customContext\.basePath : "";\s*const unwrappedParams = use\(params\);\s*const \{ addToCart/g,
      'const unwrappedParams = use(params);\n  const { addToCart'
    );
    fs.writeFileSync(prodFile, content, 'utf8');
    console.log(`Fixed products/[id]/page.tsx for ${tmpl}`);
  }
}
