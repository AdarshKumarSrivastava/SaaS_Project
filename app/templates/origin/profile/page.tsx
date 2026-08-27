"use client";
import { useCustomizationContext } from "@/context/CustomizationContext";
import PremiumProfile from "@/components/storefront/PremiumProfile";

export default function ProfilePage() {
  const __customContext = useCustomizationContext();
  const basePath = __customContext?.basePath || "/templates/origin";



  return <PremiumProfile basePath="/templates/origin" theme="light" />;
}