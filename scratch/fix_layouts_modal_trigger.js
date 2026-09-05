const fs = require('fs');
const path = require('path');

const templates = [
  'atelier', 'aurelia', 'canvas', 'essence', 'horizon',
  'minimalist', 'monument', 'nexus-pro', 'noire', 'origin',
  'quantum', 'vanta', 'velocity'
];

for (const tmpl of templates) {
  const layoutPath = path.join(__dirname, '..', 'app', 'templates', tmpl, 'layout.tsx');
  if (!fs.existsSync(layoutPath)) continue;

  let content = fs.readFileSync(layoutPath, 'utf8');

  // 1. Ensure useCustomerAuth is imported
  if (!content.includes('import { useCustomerAuth }')) {
    content = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\n' + content;
  }

  // 2. Fix double onClick attributes
  content = content.replace(
    /onClick=\{[^}]+\}\s+aria-label="Customer Account"\s+onClick=\{[^}]+\}/g,
    'type="button" aria-label="Customer Account" onClick={() => { if (typeof setIsMobileMenuOpen === "function") setIsMobileMenuOpen(false); openAuthModal(isAuthenticated ? "account" : "login"); }}'
  );
  content = content.replace(
    /onClick=\{[^}]+\}\s+onClick=\{[^}]+\}/g,
    'onClick={() => { if (typeof setIsMobileMenuOpen === "function") setIsMobileMenuOpen(false); openAuthModal(isAuthenticated ? "account" : "login"); }}'
  );

  // 3. Make sure openAuthModal and isAuthenticated are available in Header and/or main Layout functions
  // If there is function Header(...)
  if (content.includes('function Header(') && !content.slice(content.indexOf('function Header('), content.indexOf('function Header(') + 300).includes('openAuthModal')) {
    content = content.replace(
      /function\s+Header\s*\([^)]*\)\s*\{/,
      (match) => `${match}\n  const { isAuthenticated, openAuthModal } = useCustomerAuth();`
    );
  }

  // If there is Navbar or Navigation function
  if (content.includes('function Navbar(') && !content.slice(content.indexOf('function Navbar('), content.indexOf('function Navbar(') + 300).includes('openAuthModal')) {
    content = content.replace(
      /function\s+Navbar\s*\([^)]*\)\s*\{/,
      (match) => `${match}\n  const { isAuthenticated, openAuthModal } = useCustomerAuth();`
    );
  }

  // If in exported default function ...Layout
  if (!content.includes('const { isAuthenticated, openAuthModal } = useCustomerAuth();')) {
    content = content.replace(
      /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/,
      (match) => `${match}\n  const { isAuthenticated, openAuthModal } = useCustomerAuth();`
    );
  }

  fs.writeFileSync(layoutPath, content, 'utf8');
  console.log(`Cleaned layout for ${tmpl}`);
}
