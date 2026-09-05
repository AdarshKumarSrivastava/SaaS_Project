const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const templatesDir = path.join(__dirname, '..', 'app', 'templates');
const files = walk(templatesDir);
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix escaped \${basePath}
  if (content.includes('\\${basePath}')) {
    content = content.split('\\${basePath}').join('${basePath}');
    changed = true;
  }

  // Fix fallback __customContext?.basePath || "/templates/..."
  const regex = /const\s+basePath\s*=\s*__customContext\?\s*\.basePath\s*\|\|\s*(["'][^"']+["'])\s*;/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match, defaultVal) => {
      return `const basePath = typeof __customContext?.basePath === 'string' ? __customContext.basePath : ${defaultVal};`;
    });
    changed = true;
  }

  // Also check if initialBasePath || '/templates/...' in CartContext
  const cartContextRegex = /initialBasePath\s*\|\|\s*(["']\/templates\/[^"']+["'])/g;
  if (cartContextRegex.test(content)) {
    content = content.replace(cartContextRegex, (match, defaultVal) => {
      return `(typeof initialBasePath === 'string' ? initialBasePath : ${defaultVal})`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
    console.log('Fixed:', path.relative(templatesDir, file));
  }
});

console.log('Total fixed files:', fixedCount);
