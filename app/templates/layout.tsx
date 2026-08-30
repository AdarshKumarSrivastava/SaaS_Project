import { PreviewModeButton } from "./PreviewModeButton";
import { BuilderOverlay } from "@/components/builder/BuilderOverlay";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  // Fallback to normal layout (for builder preview and template selection)
  return (
    <div className="relative w-full h-full">
      {children}
      <PreviewModeButton />
      <BuilderOverlay />
    </div>
  );
}
