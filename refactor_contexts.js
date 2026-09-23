const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'app', 'templates');

// Regex for finding the useEffect block handling MONOLITH_CUSTOMIZATION
const patternUseEffect = /useEffect\(\(\)\s*=>\s*\{\s*const\s*handleMessage.*?window\.removeEventListener\("message",\s*handleMessage\);\s*\},?\s*\[\]\);/gs;

let modifiedCount = 0;

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;
            
            // Check if the file contains MONOLITH_CUSTOMIZATION
            if (content.includes('MONOLITH_CUSTOMIZATION')) {
                // If it's a context file (CartContext, ShopContext, etc.)
                if (file.includes('Context')) {
                    // Replace the useEffect block
                    content = content.replace(patternUseEffect, '');
                    
                    // Replace the initial data grab if it exists
                    content = content.replace(/const\s+initCurrency\s*=\s*initialCustomData\?\.formData\?\.currency;/g, 
                        'const customData = useCustomization();\n  const initCurrency = customData?.formData?.currency;');
                    
                    // Add useEffect to sync currencySymbol
                    const syncEffect = `
  useEffect(() => {
    setCurrencySymbol(symbolMap[initCurrency] || "$");
  }, [initCurrency]);
`;
                    if (!content.includes('setCurrencySymbol(symbolMap[initCurrency]')) {
                         // Insert it after setCurrencySymbol state definition
                         content = content.replace(/(const\s+\[currencySymbol,\s*setCurrencySymbol\]\s*=\s*useState.*?;\n)/, `$1${syncEffect}`);
                    }
                    
                    // Ensure useCustomization is imported
                    if (!content.includes('import { useCustomization }')) {
                        const importStatement = 'import { useCustomization } from "@/hooks/useCustomization";\n';
                        const lastImportIndex = content.lastIndexOf('import ');
                        if (lastImportIndex !== -1) {
                            const endOfLine = content.indexOf('\n', lastImportIndex);
                            content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
                        } else {
                            content = importStatement + content;
                        }
                    }
                } 
                // If it's a page file (e.g. products/page.tsx)
                else {
                    // They might have a slightly different useState structure
                    content = content.replace(/const\s+\[customData,\s*setCustomData\]\s*=\s*useState<any>\(.*?initialCustomData.*?\);/s, 'const customData = useCustomization();');
                    content = content.replace(patternUseEffect, '');
                    
                    if (!content.includes('import { useCustomization }')) {
                        const importStatement = 'import { useCustomization } from "@/hooks/useCustomization";\n';
                        const lastImportIndex = content.lastIndexOf('import ');
                        if (lastImportIndex !== -1) {
                            const endOfLine = content.indexOf('\n', lastImportIndex);
                            content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
                        } else {
                            content = importStatement + content;
                        }
                    }
                }
                
                if (original !== content) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    modifiedCount++;
                    console.log('Modified:', filePath);
                }
            }
        }
    }
}

walk(baseDir);
console.log(`Modified ${modifiedCount} files`);
