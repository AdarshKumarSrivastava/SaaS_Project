const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'app', 'templates');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // If it calls useCustomization() but doesn't import from "@/hooks/useCustomization"
            if (content.includes('useCustomization()') && !content.includes('@/hooks/useCustomization')) {
                const importStatement = 'import { useCustomization } from "@/hooks/useCustomization";\n';
                
                // insert right after "use client"; or at the top
                if (content.includes('"use client";')) {
                    content = content.replace('"use client";', '"use client";\n' + importStatement);
                } else {
                    content = importStatement + content;
                }
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Fixed import in:', filePath);
            }
        }
    }
}

walk(baseDir);
