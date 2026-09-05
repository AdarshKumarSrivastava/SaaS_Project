"use client";

import React, { Suspense } from "react";
import { CustomerAuthForm } from "@/components/storefront/CustomerAuthForm";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function atelierLoginPage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  const brandName = customContext?.siteData?.global?.brandName || customContext?.siteData?.name || "ATELIER";

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CustomerAuthForm mode="login" basePath={basePath} brandName={brandName} />
    </Suspense>
  );
}
