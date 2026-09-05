"use client";

import React from "react";
import PremiumProfile from "@/components/storefront/PremiumProfile";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function ProfilePage() {
  const customContext = useCustomizationContext();
  const basePath = typeof customContext?.basePath === "string" ? customContext.basePath : "";
  return <PremiumProfile basePath={basePath} theme="light" />;
}
