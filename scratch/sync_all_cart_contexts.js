const fs = require('fs');
const path = require('path');

const templates = [
  'atelier', 'aurelia', 'canvas', 'essence', 'horizon',
  'minimalist', 'monument', 'nexus-pro', 'noire', 'origin',
  'quantum', 'vanta', 'velocity'
];

for (const tmpl of templates) {
  let contextFileName = 'CartContext.tsx';
  if (tmpl === 'nexus-pro') contextFileName = 'ShopContext.tsx';
  if (tmpl === 'quantum') contextFileName = 'QuantumContext.tsx';
  if (tmpl === 'velocity') contextFileName = 'VelocityContext.tsx';

  const filePath = path.join(__dirname, '..', 'app', 'templates', tmpl, contextFileName);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Update useCustomerAuth destructuring
  content = content.replace(
    /const\s*\{\s*customer,\s*isAuthenticated,\s*siteId[^}]*\}\s*=\s*useCustomerAuth\(\);/,
    'const { customer, isAuthenticated, siteId, openAuthModal, registerCartHandler } = useCustomerAuth();'
  );

  // Update addToCart unauthenticated branch
  content = content.replace(
    /if\s*\(\!isAuthenticated\)\s*\{[\s\S]*?openAuthModal[^}]*\;\s*return;\s*\}/,
    `if (!isAuthenticated) {
      openAuthModal({
        reason: 'add-to-cart',
        pendingProduct: product,
        pendingQuantity: quantity,
        message: 'Sign in to add this item to your cart.'
      });
      return;
    }`
  );

  // Ensure registerCartHandler effect is present
  if (!content.includes('registerCartHandler((p, q, v)')) {
    content = content.replace(
      /return\s*\(\s*<CartContext\.Provider/i,
      `useEffect(() => {
    if (registerCartHandler) {
      return registerCartHandler((p: any, q?: number) => {
        addToCart(p, q || 1);
      });
    }
  }, [registerCartHandler]);\n\n  return (\n    <CartContext.Provider`
    );

    // If ShopContext or QuantumContext
    content = content.replace(
      /return\s*\(\s*<ShopContext\.Provider/i,
      `useEffect(() => {
    if (registerCartHandler) {
      return registerCartHandler((p: any, q?: number) => {
        addToCart(p, q || 1);
      });
    }
  }, [registerCartHandler]);\n\n  return (\n    <ShopContext.Provider`
    );
    content = content.replace(
      /return\s*\(\s*<QuantumContext\.Provider/i,
      `useEffect(() => {
    if (registerCartHandler) {
      return registerCartHandler((p: any, q?: number) => {
        addToCart(p, q || 1);
      });
    }
  }, [registerCartHandler]);\n\n  return (\n    <QuantumContext.Provider`
    );
    content = content.replace(
      /return\s*\(\s*<VelocityContext\.Provider/i,
      `useEffect(() => {
    if (registerCartHandler) {
      return registerCartHandler((p: any, q?: number) => {
        addToCart(p, q || 1);
      });
    }
  }, [registerCartHandler]);\n\n  return (\n    <VelocityContext.Provider`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Synced Cart Context for ${tmpl}`);
}
