"use client";

import { FirebasePhoneSignup } from "@/components/auth/FirebasePhoneSignup";

export default function minimalistSignupPage() {
  return (
    <FirebasePhoneSignup
      title="Sign Up"
      subtitle="Create an account to track orders and save your details."
      backLink="/templates/vanta"
      loginLink="/templates/vanta/auth/login"
      slug="minimalist"
      visualUrl="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2564&auto=format&fit=crop"
    />
  );
}
