const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');

function updateStandardCartContext(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure necessary imports
  if (!content.includes('useCustomerAuth')) {
    content = content.replace(
      /import \{ createContext/g,
      'import { useCustomerAuth } from "@/context/CustomerAuthContext";\nimport { useRouter, usePathname } from "next/navigation";\nimport { createContext'
    );
  }

  // Inside CartProvider, insert auth and router hooks
  if (!content.includes('useCustomerAuth()')) {
    content = content.replace(
      /export function CartProvider\([^)]*\)\s*\{/g,
      (match) => `${match}\n  const { customer, isAuthenticated, siteId } = useCustomerAuth();\n  const router = useRouter();\n  const pathname = usePathname();\n  const storageKey = \`cart_\${siteId || 'default'}_\${customer?.id || 'guest'}\`;`
    );
  }

  // Update localStorage hydration to be customer and project aware & resume pending action
  content = content.replace(
    /useEffect\(\(\) => \{\s*const savedCart = localStorage\.getItem\([^)]+\);[\s\S]*?\}, \[\]\);/g,
    `useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {}
    } else {
      setItems([]);
    }

    if (isAuthenticated) {
      const pendingItem = sessionStorage.getItem('pending_cart_add');
      if (pendingItem) {
        sessionStorage.removeItem('pending_cart_add');
        try {
          const parsed = JSON.parse(pendingItem);
          const p = parsed.product || parsed;
          if (p && p.id) {
            setItems((prev) => {
              const exists = prev.find((i) => i.product.id === p.id);
              if (exists) {
                return prev.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + (parsed.quantity || 1) } : i);
              }
              return [...prev, { product: p, quantity: parsed.quantity || 1 }];
            });
            setToastMessage(\`Added \${p.name} to cart.\`);
            setTimeout(() => setToastMessage(null), 3000);
          }
        } catch (e) {}
      }
    }
  }, [customer?.id, siteId, isAuthenticated, storageKey]);`
  );

  // Update localStorage persistence to use storageKey
  content = content.replace(
    /localStorage\.setItem\(["'][^"']*-cart["'], JSON\.stringify\(items\)\);/g,
    'localStorage.setItem(storageKey, JSON.stringify(items));'
  );

  // Update addToCart to require auth
  content = content.replace(
    /const addToCart = \((?:product: Product(?:, quantity[^)]*)?|product: any(?:, quantity[^)]*)?)\) => \{[\s\S]*?setToastMessage\([^)]+\);[\s\S]*?\};/g,
    `const addToCart = (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_add', JSON.stringify({ product, quantity }));
      }
      setToastMessage("Please sign in to add items to your cart.");
      setTimeout(() => setToastMessage(null), 3000);
      const currentPath = pathname || '/';
      router.push(\`\${basePath}/auth/login?return=\${encodeURIComponent(currentPath)}&action=add-to-cart&productId=\${encodeURIComponent(product.id)}\`);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setToastMessage(\`Added \${product.name} to cart.\`);
    setTimeout(() => setToastMessage(null), 3000);
  };`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated standard CartContext: ${filePath}`);
}

const standardCartFiles = [
  'app/templates/origin/CartContext.tsx',
  'app/templates/atelier/CartContext.tsx',
  'app/templates/aurelia/CartContext.tsx',
  'app/templates/canvas/CartContext.tsx',
  'app/templates/essence/CartContext.tsx',
  'app/templates/minimalist/CartContext.tsx',
  'app/templates/monument/CartContext.tsx',
  'app/templates/noire/CartContext.tsx',
  'app/templates/vanta/CartContext.tsx',
];

for (const rel of standardCartFiles) {
  const full = path.join(__dirname, '..', rel);
  if (fs.existsSync(full)) {
    updateStandardCartContext(full);
  }
}
