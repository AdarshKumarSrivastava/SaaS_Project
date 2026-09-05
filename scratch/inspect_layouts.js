const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');
const templateNames = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());

console.log('Found templates:', templateNames);

const issues = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  // Check for hardcoded /templates/ in href or strings
  const templatePathMatches = content.match(/['"`]\/templates\/[a-zA-Z0-9_-]+(\/[^'"`]*)?['"`]/g);
  if (templatePathMatches) {
    issues.push({ file: relPath, type: 'hardcoded /templates/ route', matches: templatePathMatches });
  }

  // Check for escaped \${basePath}
  if (content.includes('\\${basePath}')) {
    issues.push({ file: relPath, type: 'escaped \\${basePath}' });
  }

  // Check for undefined basePath usages
  if (content.includes('basePath') && !content.includes('useCustomizationContext') && !content.includes('props') && !content.includes('basePath:')) {
    // Might be missing context
  }
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(full);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      checkFile(full);
    }
  }
}

traverse(templatesDir);
console.log('Total issues found in app/templates:', issues.length);
console.log(JSON.stringify(issues, null, 2));
