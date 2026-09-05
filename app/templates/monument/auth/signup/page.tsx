"use client";

import React, { Suspense } from "react";
import { CustomerAuthForm } from "@/components/storefront/CustomerAuthForm";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function monumentSignupPage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  const brandName = customContext?.siteData?.global?.brandName || customContext?.siteData?.name || "MONUMENT";

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CustomerAuthForm mode="signup" basePath={basePath} brandName={brandName} />
    </Suspense>
  );
}
