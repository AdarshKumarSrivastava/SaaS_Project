const fs = require('fs');
const path = require('path');

// 1. Fix CustomerAuthForm.tsx
const authFormPath = path.join(__dirname, '..', 'components', 'storefront', 'CustomerAuthForm.tsx');
if (fs.existsSync(authFormPath)) {
  let content = fs.readFileSync(authFormPath, 'utf8');
  content = content.replace(
    /const returnUrl = searchParams\.get\('return'\) \|\| searchParams\.get\('next'\) \|\| "";\s*const pendingAction = searchParams\.get\('action'\);\s*const pendingProductId = searchParams\.get\('productId'\) \|\| searchParams\.get\('product'\);/,
    `const returnUrl = (searchParams ? searchParams.get('return') || searchParams.get('next') : "") || "";\n  const pendingAction = searchParams ? searchParams.get('action') : null;\n  const pendingProductId = searchParams ? searchParams.get('productId') || searchParams.get('product') : null;`
  );
  fs.writeFileSync(authFormPath, content, 'utf8');
  console.log('Fixed CustomerAuthForm.tsx');
}

// 2. Fix canvas CartContext
const canvasCartPath = path.join(__dirname, '..', 'app', 'templates', 'canvas', 'CartContext.tsx');
if (fs.existsSync(canvasCartPath)) {
  let content = fs.readFileSync(canvasCartPath, 'utf8');
  content = content.replace(
    /setToastMessage\(`Added \$\{p\.name\} to cart\.\`\);\s*setTimeout\(\(\) => setToastMessage\(null\), 3000\);/g,
    `// item restored`
  );
  fs.writeFileSync(canvasCartPath, content, 'utf8');
  console.log('Fixed canvas CartContext.tsx');
}

// 3. Fix templates with duplicate usePathname / pathname
const templates = ['atelier', 'aurelia', 'minimalist', 'monument', 'noire', 'vanta'];
for (const tmpl of templates) {
  const filePath = path.join(__dirname, '..', 'app', 'templates', tmpl, 'CartContext.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // remove duplicate import `import { usePathname } from "next/navigation";` if `useRouter, usePathname` already imported
    content = content.replace(/import\s*\{\s*usePathname\s*\}\s*from\s*"next\/navigation";\s*/g, '');
    if (!content.includes('useRouter, usePathname')) {
      content = content.replace(/import\s*\{\s*useRouter\s*\}\s*from\s*"next\/navigation";/, 'import { useRouter, usePathname } from "next/navigation";');
    }

    // remove duplicate `const pathname = usePathname();`
    let count = 0;
    content = content.replace(/const pathname = usePathname\(\);/g, (match) => {
      count++;
      return count === 1 ? match : '';
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned up ${tmpl} CartContext.tsx`);
  }
}
