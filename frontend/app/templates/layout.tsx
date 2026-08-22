import { headers } from "next/headers";
import { PreviewModeButton } from "./PreviewModeButton";
import { CustomizationProvider } from "@/context/CustomizationContext";

export default async function TemplatesLayout({ children }: { children: React.ReactNode }) {
  // Check if middleware passed live deployment data
  const headersList = await headers();
  const liveDataHeader = headersList.get('x-live-data');

  if (liveDataHeader) {
    try {
      const decoded = Buffer.from(liveDataHeader, 'base64').toString('utf8');
      const data = JSON.parse(decoded);
      
      if (data.deployment) {
        return (
          <CustomizationProvider siteData={data.deployment.schema} products={data.products}>
            <div className="relative w-full h-full">
              {children}
            </div>
          </CustomizationProvider>
        );
      }
    } catch (e) {
      console.error('Failed to parse x-live-data header', e);
    }
  }

  // Fallback to normal layout (for builder preview and template selection)
  return (
    <div className="relative w-full h-full">
      {children}
      <PreviewModeButton />
    </div>
  );
}
