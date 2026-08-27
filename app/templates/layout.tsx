import { headers } from "next/headers";
import { PreviewModeButton } from "./PreviewModeButton";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { BuilderOverlay } from "@/components/builder/BuilderOverlay";

export default async function TemplatesLayout({ children }: { children: React.ReactNode }) {
  // Check if middleware passed live deployment data
  const headersList = await headers();
  const liveDataHeader = headersList.get('x-live-data');

  let parsedData = null;

  if (liveDataHeader) {
    try {
      const decoded = Buffer.from(liveDataHeader, 'base64').toString('utf8');
      parsedData = JSON.parse(decoded);
    } catch (e) {
      console.error('Failed to parse x-live-data header', e);
    }
  }

  if (parsedData?.deployment) {
    return (
      <CustomizationProvider siteData={parsedData.deployment.schema} products={parsedData.products}>
        <div className="relative w-full h-full">
          {children}
        </div>
      </CustomizationProvider>
    );
  }

  // Fallback to normal layout (for builder preview and template selection)
  return (
    <div className="relative w-full h-full">
      {children}
      <PreviewModeButton />
      <BuilderOverlay />
    </div>
  );
}
