const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'app', 'templates');

const patternUseState = /const\s+\[customData,\s*setCustomData\]\s*=\s*useState<any>\(initialCustomData\s*\|\|\s*null\);/g;
const patternUseEffect = /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(window\.parent\s*&&\s*window\.parent\s*!==\s*window\)\s*\{\s*const\s*handleMessage\s*=\s*\(event:\s*MessageEvent\)\s*=>\s*\{\s*if\s*\(event\.data\?\.type\s*===\s*"MONOLITH_CUSTOMIZATION"\)\s*\{\s*setCustomData\(event\.data\.data\);\s*\}\s*\};\s*window\.addEventListener\("message",\s*handleMessage\);\s*window\.parent\.postMessage\(\{\s*type:\s*"MONOLITH_REQUEST_STATE"\s*\},.*?\);\s*return\s*\(\)\s*=>\s*window\.removeEventListener\("message",\s*handleMessage\);\s*\}\s*\},\s*\[\]\);/gs;

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
            
            if (patternUseState.test(content) || patternUseEffect.test(content)) {
                // Reset regex indexes
                patternUseState.lastIndex = 0;
                patternUseEffect.lastIndex = 0;
                
                let newContent = content.replace(patternUseState, 'const customData = useCustomization();');
                newContent = newContent.replace(patternUseEffect, '');
                
                if (!newContent.includes('useCustomization')) {
                    const importStatement = 'import { useCustomization } from "@/hooks/useCustomization";\n';
                    const lastImportIndex = newContent.lastIndexOf('import ');
                    if (lastImportIndex !== -1) {
                        const endOfLine = newContent.indexOf('\n', lastImportIndex);
                        newContent = newContent.slice(0, endOfLine + 1) + importStatement + newContent.slice(endOfLine + 1);
                    } else {
                        newContent = importStatement + newContent;
                    }
                }
                
                fs.writeFileSync(filePath, newContent, 'utf8');
                modifiedCount++;
                console.log('Modified:', filePath);
            }
        }
    }
}

walk(baseDir);
console.log(`Modified ${modifiedCount} files`);
