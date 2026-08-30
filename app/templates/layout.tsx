import { PreviewModeButton } from "./PreviewModeButton";
import { BuilderOverlay } from "@/components/builder/BuilderOverlay";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  // Fallback to normal layout (for builder preview and template selection)
  return (
    <div className="relative w-full h-full">
      <CustomerAuthProvider siteId="mock_template_site">
        {children}
        <PreviewModeButton />
        <BuilderOverlay />
      </CustomerAuthProvider>
    </div>
  );
}
