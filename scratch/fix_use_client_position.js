const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');

function fixUseClient(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('"use client"') || content.includes("'use client'")) {
    // Remove all occurrences of "use client" / 'use client'
    content = content.replace(/["']use client["'];?\r?\n?/g, '');
    // Trim leading whitespace/newlines and prepend "use client";\n\n
    content = '"use client";\n\n' + content.trimStart();
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
      fixUseClient(full);
    }
  }
}

traverse(templatesDir);
console.log('Fixed "use client" positioning across all templates.');
