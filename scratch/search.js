const fs = require('fs');
const path = require('path');

function walk(dir, out) {
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            walk(filePath, out);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('/templates/')) {
                out.push(filePath);
            }
        }
    });
}

const out = [];
walk('c:/Users/lenovo/Downloads/PRIME PROJECT/app', out);
walk('c:/Users/lenovo/Downloads/PRIME PROJECT/components', out);

console.log("Found in files:");
out.forEach(f => console.log(f));
