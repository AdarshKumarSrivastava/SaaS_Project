import fs from 'fs';
import path from 'path';

const templatesDir = path.join(__dirname, 'app/templates');
const templates = fs.readdirSync(templatesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let imports = '';
let registry = 'export const TEMPLATE_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {\n';
let layoutsRegistry = 'export const TEMPLATE_LAYOUTS: Record<string, React.ComponentType<any>> = {\n';

function scanDir(basePath: string, relativePath: string, template: string) {
  const currentPath = path.join(basePath, relativePath);
  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      scanDir(basePath, path.join(relativePath, item.name), template);
    } else if (item.name === 'page.tsx') {
      const routePath = relativePath === '' ? '/' : `/${relativePath.replace(/\\/g, '/')}`;
      
      const componentName = `${template.replace(/-/g, '_')}_${routePath.replace(/\//g, '_').replace(/\[/g, '$').replace(/\]/g, '$').replace(/-/g, '_')}`;
      const importPath = `@/app/templates/${template}${routePath === '/' ? '' : routePath}/page`;
      
      imports += `import ${componentName} from '${importPath}';\n`;
      registry += `    '${routePath}': ${componentName},\n`;
    } else if (relativePath === '' && item.name === 'layout.tsx') {
      const layoutName = `${template.replace(/-/g, '_')}_layout`;
      const importPath = `@/app/templates/${template}/layout`;
      imports += `import ${layoutName} from '${importPath}';\n`;
      layoutsRegistry += `  '${template}': ${layoutName},\n`;
    }
  }
}

for (const template of templates) {
  registry += `  '${template}': {\n`;
  scanDir(path.join(templatesDir, template), '', template);
  registry += `  },\n`;
}

registry += '};\n';
layoutsRegistry += '};\n';

const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
import React from 'react';

${imports}

${registry}
${layoutsRegistry}
`;

fs.writeFileSync(path.join(__dirname, 'lib/template-components.ts'), fileContent);
console.log('Successfully generated lib/template-components.ts');
