const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace any occurrence of multiple declarations of __customContext and basePath
  // Match single or double quote variations
  content = content.replace(/(?:[ \t]*const __customContext = useCustomizationContext\(\);[ \t]*\r?\n[ \t]*const basePath = typeof __customContext\?\.basePath === ['"]string['"] \? __customContext\.basePath : "";[ \t]*\r?\n)+/g, '  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";\n');

  // Also in profile/orders pages:
  content = content.replace(/(?:[ \t]*const customContext = useCustomizationContext\(\);[ \t]*\r?\n[ \t]*const basePath = typeof customContext\?\.basePath === ['"]string['"] \? customContext\.basePath : "";[ \t]*\r?\n)+/g, '  const customContext = useCustomizationContext();\n  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";\n');

  // If a file has `const customContext = ...` followed by `const __customContext = ...`
  content = content.replace(/[ \t]*const customContext = useCustomizationContext\(\);[ \t]*\r?\n[ \t]*const basePath = typeof customContext\?\.basePath === "string" \? customContext\.basePath : "";[ \t]*\r?\n[ \t]*const __customContext = useCustomizationContext\(\);[ \t]*\r?\n[ \t]*const basePath = typeof __customContext\?\.basePath === "string" \? __customContext\.basePath : "";/g, '  const customContext = useCustomizationContext();\n  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";');

  // Also in cart/checkout/page.tsx: if props has { basePath } or params has basePath, and we also declared const basePath
  // Check for duplicate basePath in same block:
  content = content.replace(/const basePath = [^\n;]+;\s*const __customContext = useCustomizationContext\(\);\s*const basePath = [^\n;]+;/g, 'const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(full);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      cleanFile(full);
    }
  }
}

traverse(templatesDir);
console.log('Deduped all declarations.');
