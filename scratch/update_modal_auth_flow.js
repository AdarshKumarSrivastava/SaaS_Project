const fs = require('fs');
const path = require('path');

const templates = [
  'atelier', 'aurelia', 'canvas', 'essence', 'horizon',
  'minimalist', 'monument', 'nexus-pro', 'noire', 'origin',
  'quantum', 'vanta', 'velocity'
];

console.log('--- Updating Cart Contexts for Floating Auth Modal ---');

// 1. Update CartContext / ShopContext / QuantumContext / VelocityContext
for (const tmpl of templates) {
  let contextFileName = 'CartContext.tsx';
  if (tmpl === 'nexus-pro') contextFileName = 'ShopContext.tsx';
  if (tmpl === 'quantum') contextFileName = 'QuantumContext.tsx';
  if (tmpl === 'velocity') contextFileName = 'VelocityContext.tsx';

  const filePath = path.join(__dirname, '..', 'app', 'templates', tmpl, contextFileName);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Update useCustomerAuth hook call to destructure openAuthModal and setPendingCartItem
  content = content.replace(
    /const\s*\{\s*customer,\s*isAuthenticated,\s*siteId\s*\}\s*=\s*useCustomerAuth\(\);/,
    'const { customer, isAuthenticated, siteId, openAuthModal, setPendingCartItem } = useCustomerAuth();'
  );

  // Update addToCart to use openAuthModal instead of router.push
  // Replace router.push(${basePath}/auth/login...) with openAuthModal('login', 'Sign in to add this item to your cart.')
  content = content.replace(
    /if\s*\(\!isAuthenticated\)\s*\{[\s\S]*?router\.push\([^)]+\);\s*return;\s*\}/,
    `if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_add', JSON.stringify({ product, quantity }));
      }
      setPendingCartItem?.({ product, quantity });
      openAuthModal?.('login', 'Sign in to add this item to your cart.');
      return;
    }`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated Cart Context for ${tmpl}`);
}

console.log('\n--- Updating Layouts for Floating Auth Modal Profile Icon ---');

// 2. Update Layouts
for (const tmpl of templates) {
  const layoutPath = path.join(__dirname, '..', 'app', 'templates', tmpl, 'layout.tsx');
  if (!fs.existsSync(layoutPath)) continue;

  let content = fs.readFileSync(layoutPath, 'utf8');

  // Ensure useCustomerAuth is imported
  if (!content.includes('useCustomerAuth')) {
    content = content.replace(
      /import\s*\{\s*useCustomizationContext\s*\}\s*from\s*"@\/context\/CustomizationContext";/,
      'import { useCustomizationContext } from "@/context/CustomizationContext";\nimport { useCustomerAuth } from "@/context/CustomerAuthContext";'
    );
    if (!content.includes('useCustomerAuth')) {
      content = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\n' + content;
    }
  }

  // Ensure const { isAuthenticated, openAuthModal } = useCustomerAuth(); is called inside component
  if (!content.includes('openAuthModal')) {
    content = content.replace(
      /const\s+basePath\s*=\s*[^;]+;/,
      (match) => `${match}\n  const { isAuthenticated, openAuthModal } = useCustomerAuth();`
    );
  }

  // Replace desktop profile links
  content = content.replace(
    /<Link\s+href=\{`\$\{basePath\}\/profile`\}\s+([^>]*)>([\s\S]*?)<\/Link>/g,
    (match, attrs, inner) => {
      // Check if this was a mobile menu link with text
      if (inner.includes('My Account') || inner.includes('Account')) {
        return `<button type="button" onClick={() => { if (typeof setIsMobileMenuOpen === 'function') setIsMobileMenuOpen(false); openAuthModal(isAuthenticated ? 'account' : 'login'); }} ${attrs}>${inner}</button>`;
      }
      return `<button type="button" onClick={() => openAuthModal(isAuthenticated ? 'account' : 'login')} aria-label="Customer Account" ${attrs}>${inner}</button>`;
    }
  );

  // Also replace href={`${basePath}/profile`} if inside <a> or <button>
  content = content.replace(
    /href=\{`\$\{basePath\}\/profile`\}/g,
    'onClick={() => openAuthModal(isAuthenticated ? "account" : "login")}'
  );

  fs.writeFileSync(layoutPath, content, 'utf8');
  console.log(`Updated Layout for ${tmpl}`);
}
