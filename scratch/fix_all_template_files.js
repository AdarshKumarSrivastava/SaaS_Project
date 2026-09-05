const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');
const templateNames = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());

console.log('Processing templates:', templateNames);

let totalModifications = 0;

for (const tmpl of templateNames) {
  const tmplDir = path.join(templatesDir, tmpl);

  // 1. Fix Profile Page
  const profileFile = path.join(tmplDir, 'profile', 'page.tsx');
  if (fs.existsSync(profileFile)) {
    let content = fs.readFileSync(profileFile, 'utf8');
    if (!content.includes('useCustomizationContext')) {
      const isDark = content.includes('theme="dark"');
      content = `"use client";\nimport React from "react";\nimport { PremiumProfile } from "@/components/templates/PremiumProfile";\nimport { useCustomizationContext } from "@/context/CustomizationContext";\n\nexport default function ${tmpl.replace(/[-_]/g, '')}ProfilePage() {\n  const customContext = useCustomizationContext();\n  const basePath = typeof customContext?.basePath === 'string' ? customContext.basePath : "";\n  return <PremiumProfile basePath={basePath} theme="${isDark ? 'dark' : 'light'}" />;\n}\n`;
      fs.writeFileSync(profileFile, content, 'utf8');
      console.log(`Updated profile page for ${tmpl}`);
      totalModifications++;
    } else {
      // Ensure basePath is safe
      content = content.replace(/basePath="\/templates\/[^"]*"/g, 'basePath={basePath}');
      fs.writeFileSync(profileFile, content, 'utf8');
    }
  }

  // 2. Fix Orders Page
  const ordersFile = path.join(tmplDir, 'orders', 'page.tsx');
  if (fs.existsSync(ordersFile)) {
    let content = fs.readFileSync(ordersFile, 'utf8');
    if (!content.includes('useCustomizationContext')) {
      const isDark = content.includes('theme="dark"');
      content = `"use client";\nimport React from "react";\nimport { PremiumProfile } from "@/components/templates/PremiumProfile";\nimport { useCustomizationContext } from "@/context/CustomizationContext";\n\nexport default function ${tmpl.replace(/[-_]/g, '')}OrdersPage() {\n  const customContext = useCustomizationContext();\n  const basePath = typeof customContext?.basePath === 'string' ? customContext.basePath : "";\n  return <PremiumProfile basePath={basePath} theme="${isDark ? 'dark' : 'light'}" defaultTab="orders" />;\n}\n`;
      fs.writeFileSync(ordersFile, content, 'utf8');
      console.log(`Updated orders page for ${tmpl}`);
      totalModifications++;
    } else {
      content = content.replace(/basePath="\/templates\/[^"]*"/g, 'basePath={basePath}');
      fs.writeFileSync(ordersFile, content, 'utf8');
    }
  }

  // 3. Fix Auth Login Page
  const loginFile = path.join(tmplDir, 'auth', 'login', 'page.tsx');
  if (fs.existsSync(loginFile)) {
    let content = fs.readFileSync(loginFile, 'utf8');
    // Replace hardcoded next and backLink with dynamic basePath
    if (!content.includes('useCustomizationContext')) {
      content = content.replace(/import { useState } from 'react';/, "import { useState } from 'react';\nimport { useCustomizationContext } from '@/context/CustomizationContext';");
      content = content.replace(/export default function [^{]*{/, (match) => {
        return `${match}\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === 'string' ? __customContext.basePath : "";`;
      });
    }
    content = content.replace(/const next = `\/templates\/[^`]*`;/g, 'const next = basePath || "/";');
    content = content.replace(/backLink=\{`?\/templates\/[^`"}]*`?\}/g, 'backLink={basePath || "/"}');
    content = content.replace(/signupLink=\{`?\/templates\/[^`/"]*\/auth\/signup`?\}/g, 'signupLink={`${basePath}/auth/signup`}');
    fs.writeFileSync(loginFile, content, 'utf8');
    console.log(`Updated auth login page for ${tmpl}`);
    totalModifications++;
  }

  // 4. Fix Auth Signup Page
  const signupFile = path.join(tmplDir, 'auth', 'signup', 'page.tsx');
  if (fs.existsSync(signupFile)) {
    let content = fs.readFileSync(signupFile, 'utf8');
    if (!content.includes('useCustomizationContext')) {
      content = content.replace(/import { useState } from 'react';/, "import { useState } from 'react';\nimport { useCustomizationContext } from '@/context/CustomizationContext';");
      content = content.replace(/export default function [^{]*{/, (match) => {
        return `${match}\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === 'string' ? __customContext.basePath : "";`;
      });
    }
    content = content.replace(/backLink="\/templates\/[^"]*"/g, 'backLink={basePath || "/"}');
    content = content.replace(/loginLink="\/templates\/[^"]*\/auth\/login"/g, 'loginLink={`${basePath}/auth/login`}');
    fs.writeFileSync(signupFile, content, 'utf8');
    console.log(`Updated auth signup page for ${tmpl}`);
    totalModifications++;
  }

  // 5. Fix CartContext if present
  const cartContextFile = path.join(tmplDir, 'CartContext.tsx');
  if (fs.existsSync(cartContextFile)) {
    let content = fs.readFileSync(cartContextFile, 'utf8');
    content = content.replace(/const basePath = ['"`]\/templates\/[^'"`]*['"`];/g, 'const basePath = "";');
    content = content.replace(/: ['"`]\/templates\/[^'"`]*['"`];/g, ': "";');
    fs.writeFileSync(cartContextFile, content, 'utf8');
    console.log(`Updated CartContext for ${tmpl}`);
    totalModifications++;
  }

  // 6. Fix Layout File
  const layoutFile = path.join(tmplDir, 'layout.tsx');
  if (fs.existsSync(layoutFile)) {
    let content = fs.readFileSync(layoutFile, 'utf8');
    if (!content.includes('useCustomizationContext')) {
      content = content.replace(/import { useCustomization } from ["']@\/hooks\/useCustomization["'];/, 'import { useCustomization } from "@/hooks/useCustomization";\nimport { useCustomizationContext } from "@/context/CustomizationContext";');
    }
    
    // Replace all /templates/<tmpl>/... in layout hrefs
    const regex = new RegExp(`['"\`]/templates/${tmpl}(/[^'"\`]*)?['"\`]`, 'g');
    content = content.replace(regex, (match, subPath) => {
      const p = subPath || '';
      return '`${basePath}' + p + '`';
    });

    // Also handle fallback `/templates/${tmpl}`
    content = content.replace(new RegExp(`basePath !== undefined \\? basePath : ['"\`]/templates/${tmpl}['"\`]`, 'g'), 'typeof basePath === "string" ? basePath : ""');

    // Ensure layout components declare basePath
    if (content.includes('QuantumNavigation') || content.includes('NexusNavigation') || content.includes('QuantumFooter')) {
      content = content.replace(/function QuantumNavigation\(\) {/g, 'function QuantumNavigation() {\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";');
      content = content.replace(/function QuantumFooter\(\) {/g, 'function QuantumFooter() {\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";');
    }

    fs.writeFileSync(layoutFile, content, 'utf8');
    console.log(`Updated layout for ${tmpl}`);
    totalModifications++;
  }
}

console.log(`Total modifications: ${totalModifications}`);
