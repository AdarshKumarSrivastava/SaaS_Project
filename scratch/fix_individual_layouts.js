const fs = require('fs');
const path = require('path');

// 1. Fix canvas/layout.tsx
const canvasPath = path.join(__dirname, '..', 'app', 'templates', 'canvas', 'layout.tsx');
if (fs.existsSync(canvasPath)) {
  let c = fs.readFileSync(canvasPath, 'utf8');
  if (!c.includes('import { useCustomerAuth }')) {
    c = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\n' + c;
  }
  c = c.replace(
    /function Navigation\(\) \{/,
    'function Navigation() {\n  const { isAuthenticated, openAuthModal } = useCustomerAuth();'
  );
  fs.writeFileSync(canvasPath, c, 'utf8');
  console.log('Fixed canvas layout');
}

// 2. Fix nexus-pro/layout.tsx
const nexusPath = path.join(__dirname, '..', 'app', 'templates', 'nexus-pro', 'layout.tsx');
if (fs.existsSync(nexusPath)) {
  let c = fs.readFileSync(nexusPath, 'utf8');
  if (!c.includes('import { useCustomerAuth }')) {
    c = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\n' + c;
  }
  c = c.replace(
    /function Navbar\(\{ initialCustomData, basePath \}: \{ initialCustomData\?: any, basePath: string \}\) \{/,
    'function Navbar({ initialCustomData, basePath }: { initialCustomData?: any, basePath: string }) {\n  const { isAuthenticated, openAuthModal } = useCustomerAuth();'
  );
  c = c.replace(
    /<button type="button" onClick=\{[^}]+\}\s+onClick=\{[^}]+\}/g,
    '<button type="button" onClick={() => { setIsMobileMenuOpen(false); openAuthModal(isAuthenticated ? "account" : "login"); }}'
  );
  fs.writeFileSync(nexusPath, c, 'utf8');
  console.log('Fixed nexus-pro layout');
}

// 3. Fix horizon/layout.tsx
const horizonPath = path.join(__dirname, '..', 'app', 'templates', 'horizon', 'layout.tsx');
if (fs.existsSync(horizonPath)) {
  let c = fs.readFileSync(horizonPath, 'utf8');
  c = c.replace(/<button type="button" type="button"/g, '<button type="button"');
  fs.writeFileSync(horizonPath, c, 'utf8');
  console.log('Fixed horizon layout');
}

// 4. Fix quantum/layout.tsx
const quantumPath = path.join(__dirname, '..', 'app', 'templates', 'quantum', 'layout.tsx');
if (fs.existsSync(quantumPath)) {
  let c = fs.readFileSync(quantumPath, 'utf8');
  c = c.replace(/<button type="button" type="button"/g, '<button type="button"');
  fs.writeFileSync(quantumPath, c, 'utf8');
  console.log('Fixed quantum layout');
}
