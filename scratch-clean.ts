import * as fs from 'fs';
const file = 'app/sites/[siteId]/builder/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const badBlockStart = `  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!siteData) return;
      
      if (e.data?.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [siteData, currentStepIndex]);
        if (!navigatedPath) return;
        
        const idx = siteData.pages.findIndex(p => {
           if (p.path === '/') return navigatedPath.endsWith('/' + templateSlug);
           return navigatedPath.includes(p.path);
        });
        
        if (idx !== -1 && idx !== currentStepIndex) {
          setCurrentStepIndex(idx);
          router.replace(\`?page=\${siteData.pages[idx].id}\`, { scroll: false });
        }
      } else if (e.data?.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [siteData, products]);`;

const replacement = `  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!siteData) return;
      if (e.data?.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [siteData]);`;

if (content.includes(badBlockStart)) {
    fs.writeFileSync(file, content.replace(badBlockStart, replacement));
    console.log('Fixed syntax error!');
} else {
    console.log('Block not found. Need to review.');
}
