const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'app', 'templates');
const templateNames = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());

for (const tmpl of templateNames) {
  // 1. Login Page
  const loginDir = path.join(templatesDir, tmpl, 'auth', 'login');
  if (fs.existsSync(loginDir)) {
    const loginPath = path.join(loginDir, 'page.tsx');
    const content = `"use client";

import React, { Suspense } from "react";
import { CustomerAuthForm } from "@/components/storefront/CustomerAuthForm";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function ${tmpl.replace(/[-_]/g, '')}LoginPage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  const brandName = customContext?.siteData?.global?.brandName || customContext?.siteData?.name || "${tmpl.toUpperCase()}";

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CustomerAuthForm mode="login" basePath={basePath} brandName={brandName} />
    </Suspense>
  );
}
`;
    fs.writeFileSync(loginPath, content, 'utf8');
    console.log(`Updated auth login for ${tmpl}`);
  }

  // 2. Signup Page
  const signupDir = path.join(templatesDir, tmpl, 'auth', 'signup');
  if (fs.existsSync(signupDir)) {
    const signupPath = path.join(signupDir, 'page.tsx');
    const content = `"use client";

import React, { Suspense } from "react";
import { CustomerAuthForm } from "@/components/storefront/CustomerAuthForm";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function ${tmpl.replace(/[-_]/g, '')}SignupPage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  const brandName = customContext?.siteData?.global?.brandName || customContext?.siteData?.name || "${tmpl.toUpperCase()}";

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CustomerAuthForm mode="signup" basePath={basePath} brandName={brandName} />
    </Suspense>
  );
}
`;
    fs.writeFileSync(signupPath, content, 'utf8');
    console.log(`Updated auth signup for ${tmpl}`);
  }
}
