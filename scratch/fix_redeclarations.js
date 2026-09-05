const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');

function fix(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. If it's a ProfilePage
  if (filePath.endsWith('profile' + path.sep + 'page.tsx') || filePath.endsWith('profile/page.tsx')) {
    const isDark = content.includes('theme="dark"');
    content = `"use client";
import React from "react";
import PremiumProfile from "@/components/storefront/PremiumProfile";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function ProfilePage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  return <PremiumProfile basePath={basePath} theme="${isDark ? 'dark' : 'light'}" />;
}
`;
    fs.writeFileSync(filePath, content, 'utf8');
    return;
  }

  // 2. If it's an OrdersPage
  if (filePath.endsWith('orders' + path.sep + 'page.tsx') || filePath.endsWith('orders/page.tsx')) {
    const isDark = content.includes('theme="dark"');
    content = `"use client";
import React from "react";
import PremiumProfile from "@/components/storefront/PremiumProfile";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function OrdersPage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  return <PremiumProfile basePath={basePath} theme="${isDark ? 'dark' : 'light'}" defaultTab="orders" />;
}
`;
    fs.writeFileSync(filePath, content, 'utf8');
    return;
  }

  // 3. Remove duplicate basePath if useCart / destructuring already provides basePath
  // e.g. const __customContext = useCustomizationContext();
  //      const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";
  //      const { ..., basePath } = useCart();
  content = content.replace(
    /const __customContext = useCustomizationContext\(\);\s*const basePath = typeof __customContext\?\.basePath === "string" \? __customContext\.basePath : "";\s*(const \{[^}]*basePath[^}]*\} = (?:useCart|useShop|useVelocity)\(\);)/g,
    '$1'
  );

  // 4. Remove duplicate declarations of __customContext and basePath in any function
  const lines = content.split('\n');
  const newLines = [];
  let declaredInScope = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('function ') || line.includes('=> {')) {
      declaredInScope.clear();
      newLines.push(line);
      continue;
    }

    if (line.includes('const __customContext = useCustomizationContext();')) {
      if (declaredInScope.has('__customContext')) {
        continue;
      }
      declaredInScope.add('__customContext');
    }

    if (line.includes('const basePath = typeof __customContext?.basePath') || line.includes('const basePath = typeof customContext?.basePath')) {
      if (declaredInScope.has('basePath')) {
        continue;
      }
      declaredInScope.add('basePath');
    }

    if (line.includes('const {') && line.includes('basePath') && (line.includes('useCart(') || line.includes('useShop(') || line.includes('useVelocity('))) {
      declaredInScope.add('basePath');
    }

    newLines.push(line);
  }

  content = newLines.join('\n');

  if (content !== original) {
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
      fix(full);
    }
  }
}

traverse(templatesDir);
console.log('Finished precise AST/line deduplication.');
