import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomizationProvider } from '@/context/CustomizationContext';
import Link from 'next/link';
import { Globe, Rocket } from 'lucide-react';

// Dynamically or statically map templates
import OriginHomePage from '@/app/templates/origin/page';
import MinimalistHomePage from '@/app/templates/minimalist/page';
import EssenceHomePage from '@/app/templates/essence/page';
import CanvasHomePage from '@/app/templates/canvas/page';
import NexusProHomePage from '@/app/templates/nexus-pro/page';
import VelocityHomePage from '@/app/templates/velocity/page';
import QuantumHomePage from '@/app/templates/quantum/page';
import HorizonHomePage from '@/app/templates/horizon/page';
import AureliaHomePage from '@/app/templates/aurelia/page';
import NoireHomePage from '@/app/templates/noire/page';
import MonumentHomePage from '@/app/templates/monument/page';
import VantaHomePage from '@/app/templates/vanta/page';
import AtelierHomePage from '@/app/templates/atelier/page';

const TEMPLATES: Record<string, React.ComponentType> = {
  'origin': OriginHomePage,
  'minimalist': MinimalistHomePage,
  'essence': EssenceHomePage,
  'canvas': CanvasHomePage,
  'nexus-pro': NexusProHomePage,
  'velocity': VelocityHomePage,
  'quantum': QuantumHomePage,
  'horizon': HorizonHomePage,
  'aurelia': AureliaHomePage,
  'noire': NoireHomePage,
  'monument': MonumentHomePage,
  'vanta': VantaHomePage,
  'atelier': AtelierHomePage,
};

export default async function LiveSitePage({ params }: { params: Promise<{ siteId: string }> | { siteId: string } }) {
  // Await params if it's a promise (Next.js 15+ behavior)
  const resolvedParams = await params;
  const siteId = resolvedParams.siteId;

  // 1. Fetch site with published deployment
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      publishedDeployment: true,
      products: {
        where: { status: 'ACTIVE' },
        include: { variants: true }
      }
    }
  });

  if (!site) {
    notFound();
  }

  // 2. Check if a LIVE published deployment exists
  const deployment = site.publishedDeployment;
  
  if (!deployment || deployment.status !== 'LIVE') {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-bg-elevated border border-line rounded-3xl p-12 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 bg-bg-subtle rounded-2xl flex items-center justify-center mb-6 border border-line">
            <Globe className="w-8 h-8 text-ink-soft" />
          </div>
          <h2 className="text-xl font-bold text-ink tracking-tight mb-2 uppercase">
            This project has not been deployed yet.
          </h2>
          <p className="text-ink-soft text-sm mb-8">
            Deploy your project from the dashboard to make it accessible to the world.
          </p>
          <div className="flex flex-col w-full gap-4">
            <Link 
              href={`/sites/${siteId}/admin`} 
              className="w-full bg-ink text-bg-elevated font-bold py-3.5 rounded-xl hover:bg-ink/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              🚀 DEPLOY LIVE
            </Link>
            <Link 
              href={`/sites/${siteId}/admin`} 
              className="text-sm text-ink-soft font-semibold hover:text-ink transition-colors"
            >
              Deploy now &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Resolve template
  const schema: any = deployment.schema || {};
  const templateSlug = schema.global?.templateSlug || 'velocity';
  
  const TemplateComponent = TEMPLATES[templateSlug] || VelocityHomePage;

  return (
    <CustomizationProvider siteData={schema} products={site.products}>
      <TemplateComponent />
    </CustomizationProvider>
  );
}
