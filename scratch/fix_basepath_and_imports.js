const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Fix incorrect import of PremiumProfile
  if (content.includes('@/components/templates/PremiumProfile')) {
    content = content.replace(/@\/components\/templates\/PremiumProfile/g, '@/components/storefront/PremiumProfile');
    modified = true;
  }

  // 2. Fix duplicated / missing imports of useCustomizationContext
  if (content.includes('useCustomizationContext') && !content.includes("from '@/context/CustomizationContext'") && !content.includes('from "@/context/CustomizationContext"')) {
    // Add import at the top
    content = `import { useCustomizationContext } from "@/context/CustomizationContext";\n` + content;
    modified = true;
  }

  // 3. Check for function definitions that need basePath
  // Split content into functions or scan for functions using basePath
  if (content.includes('basePath')) {
    // Ensure import exists
    if (!content.includes("from '@/context/CustomizationContext'") && !content.includes('from "@/context/CustomizationContext"')) {
      content = `import { useCustomizationContext } from "@/context/CustomizationContext";\n` + content;
      modified = true;
    }

    // Replace functions that use basePath but don't declare it
    // Match function components: function X(...) { or const X = (...) => {
    // Or export default function X(...) {
    const lines = content.split('\n');
    let inFunction = false;
    let funcHasBasePathUsage = false;
    let funcDeclaresBasePath = false;
    let funcInsertIndex = -1;

    // A simpler AST-like regex approach:
    // Match each function declaration: (?:export\s+default\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{
    content = content.replace(/((?:export\s+(?:default\s+)?)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{)/g, (match, fullDecl, funcName, params) => {
      // If params already includes basePath or function is not a React component (e.g. helper), don't force unless needed
      if (params.includes('basePath')) return match;
      return `${match}\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === 'string' ? __customContext.basePath : "";`;
    });

    // Clean up duplicate declarations if any:
    content = content.replace(/(\s*const __customContext = useCustomizationContext\(\);\s*const basePath = typeof __customContext\?\.basePath === 'string' \? __customContext\.basePath : "";)+/g, '\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === \'string\' ? __customContext.basePath : "";');

    // Clean up if props.basePath was already declared
    content = content.replace(/const basePath = [^\n]+;\s*const basePath =/g, 'const basePath =');

    modified = true;
  }

  if (modified) {
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
      fixFile(full);
    }
  }
}

traverse(templatesDir);
console.log('Finished fixing basePath and imports across all templates.');
