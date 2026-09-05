const fs = require('fs');
const path = require('path');

// 1. Update nexus-pro/ShopContext.tsx
const nexusPath = path.join(__dirname, '..', 'app', 'templates', 'nexus-pro', 'ShopContext.tsx');
if (fs.existsSync(nexusPath)) {
  let content = fs.readFileSync(nexusPath, 'utf8');
  if (!content.includes('useCustomerAuth')) {
    content = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\nimport { useRouter, usePathname } from "next/navigation";\nimport { useCustomizationContext } from "@/context/CustomizationContext";\n' + content;
  }
  content = content.replace(
    /export function ShopProvider\([^)]*\)\s*\{/g,
    (match) => `${match}\n  const { customer, isAuthenticated, siteId } = useCustomerAuth();\n  const router = useRouter();\n  const pathname = usePathname();\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";\n  const storageKey = \`cart_\${siteId || 'default'}_\${customer?.id || 'guest'}\`;`
  );
  content = content.replace(
    /const addToCart = \((?:product: Product, quantity = 1|product: any, quantity = 1)\) => \{[\s\S]*?setIsCartOpen\(true\);[\s\S]*?\};/g,
    `const addToCart = (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_add', JSON.stringify({ product, quantity }));
      }
      const currentPath = pathname || '/';
      router.push(\`\${basePath}/auth/login?return=\${encodeURIComponent(currentPath)}&action=add-to-cart&productId=\${encodeURIComponent(product.id)}\`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };`
  );
  fs.writeFileSync(nexusPath, content, 'utf8');
  console.log('Updated nexus-pro ShopContext');
}

// 2. Update quantum/QuantumContext.tsx
const quantumPath = path.join(__dirname, '..', 'app', 'templates', 'quantum', 'QuantumContext.tsx');
if (fs.existsSync(quantumPath)) {
  let content = fs.readFileSync(quantumPath, 'utf8');
  if (!content.includes('useCustomerAuth')) {
    content = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\nimport { useRouter, usePathname } from "next/navigation";\nimport { useCustomizationContext } from "@/context/CustomizationContext";\n' + content;
  }
  content = content.replace(
    /export function QuantumProvider\([^)]*\)\s*\{/g,
    (match) => `${match}\n  const { customer, isAuthenticated, siteId } = useCustomerAuth();\n  const router = useRouter();\n  const pathname = usePathname();\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";\n  const storageKey = \`cart_\${siteId || 'default'}_\${customer?.id || 'guest'}\`;`
  );
  content = content.replace(
    /const addToCart = \(product: QuantumProduct\) => \{[\s\S]*?showToast\([^)]+\);[\s\S]*?\};/g,
    `const addToCart = (product: QuantumProduct) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_add', JSON.stringify({ product, quantity: 1 }));
      }
      const currentPath = pathname || '/';
      router.push(\`\${basePath}/auth/login?return=\${encodeURIComponent(currentPath)}&action=add-to-cart&productId=\${encodeURIComponent(product.id)}\`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(\`Added \${product.name} to cart\`);
  };`
  );
  fs.writeFileSync(quantumPath, content, 'utf8');
  console.log('Updated quantum QuantumContext');
}

// 3. Update velocity/VelocityContext.tsx
const velocityPath = path.join(__dirname, '..', 'app', 'templates', 'velocity', 'VelocityContext.tsx');
if (fs.existsSync(velocityPath)) {
  let content = fs.readFileSync(velocityPath, 'utf8');
  if (!content.includes('useCustomerAuth')) {
    content = 'import { useCustomerAuth } from "@/context/CustomerAuthContext";\nimport { useRouter, usePathname } from "next/navigation";\nimport { useCustomizationContext } from "@/context/CustomizationContext";\n' + content;
  }
  content = content.replace(
    /export function VelocityProvider\([^)]*\)\s*\{/g,
    (match) => `${match}\n  const { customer, isAuthenticated, siteId } = useCustomerAuth();\n  const router = useRouter();\n  const pathname = usePathname();\n  const __customContext = useCustomizationContext();\n  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";\n  const storageKey = \`cart_\${siteId || 'default'}_\${customer?.id || 'guest'}\`;`
  );
  content = content.replace(
    /const addToCart = \(product: VelocityProduct, size = "L"\) => \{[\s\S]*?setIsCartOpen\(true\);[\s\S]*?\};/g,
    `const addToCart = (product: VelocityProduct, size = "L") => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_add', JSON.stringify({ product, quantity: 1, selectedSize: size }));
      }
      const currentPath = pathname || '/';
      router.push(\`\${basePath}/auth/login?return=\${encodeURIComponent(currentPath)}&action=add-to-cart&productId=\${encodeURIComponent(product.id)}\`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setIsCartOpen(true);
  };`
  );
  fs.writeFileSync(velocityPath, content, 'utf8');
  console.log('Updated velocity VelocityContext');
}
