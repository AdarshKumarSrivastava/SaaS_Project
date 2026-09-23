import { PreviewModeButton } from "./PreviewModeButton";
import { BuilderOverlay } from "@/components/builder/BuilderOverlay";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { TemplateDirectRenderer } from "@/components/TemplateDirectRenderer";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  // Fallback to normal layout (for builder preview and template selection)
  return (
    <div className="relative w-full h-full">
      <CustomerAuthProvider siteId="mock_template_site">
        <TemplateDirectRenderer>
          {children}
        </TemplateDirectRenderer>
        <PreviewModeButton />
        <BuilderOverlay />
      </CustomerAuthProvider>
    </div>
  );
}
