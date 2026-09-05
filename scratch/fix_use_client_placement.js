const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'app', 'templates', 'nexus-pro', 'ShopContext.tsx'),
  path.join(__dirname, '..', 'app', 'templates', 'quantum', 'QuantumContext.tsx'),
  path.join(__dirname, '..', 'app', 'templates', 'velocity', 'VelocityContext.tsx')
];

for (const filePath of targetFiles) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove all existing "use client";
    content = content.replace(/["']use client["'];?\r?\n?/g, '');
    // Prepend "use client"; at line 1
    content = '"use client";\n' + content.trimStart();
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed "use client" in ${filePath}`);
  }
}
