import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, 'app/sites/[siteId]/builder/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add activeTab and history state
content = content.replace(
  `const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');`,
  `const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'pages' | 'theme' | 'navigation'>('pages');
  
  // History State for Undo/Redo
  const [history, setHistory] = useState<SiteData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const skipHistoryRecord = useRef(false);
`
);

// 2. Add icons import
content = content.replace(
  `Upload, Image as ImageIcon`,
  `Upload, Image as ImageIcon, Undo, Redo, Paintbrush, FileText, Navigation`
);

// 3. Update the handleSave / auto-save logic
// We want to add debounced autosave.
content = content.replace(
  `  const handleSave = async () => {`,
  `  // Push to history when siteData changes
  useEffect(() => {
    if (!siteData) return;
    if (skipHistoryRecord.current) {
       skipHistoryRecord.current = false;
       return;
    }
    setHistory(prev => {
       const newHistory = prev.slice(0, historyIndex + 1);
       newHistory.push(JSON.parse(JSON.stringify(siteData)));
       if (newHistory.length > 50) newHistory.shift(); // Keep last 50 edits
       return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [siteData]);

  // Debounced auto-save
  useEffect(() => {
    if (!siteData) return;
    const timeout = setTimeout(() => {
       handleSave(siteData);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [siteData]);

  const undo = () => {
    if (historyIndex > 0) {
       skipHistoryRecord.current = true;
       setHistoryIndex(prev => prev - 1);
       setSiteData(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
       skipHistoryRecord.current = true;
       setHistoryIndex(prev => prev + 1);
       setSiteData(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleSave = async (dataToSave = siteData) => {`
);

// 4. Update the handleSave call in the button and remove the manual Next/Prev flow
content = content.replace(
  `await apiClient.patch(\`/api/sites/\${siteId}/schema\`, {
        schema: siteData
      });`,
  `await apiClient.patch(\`/api/sites/\${siteId}/schema\`, {
        schema: dataToSave
      });`
);

// 5. Replace right panel entirely.
// Find the right panel start: `<div className="w-[420px]`
// And replace everything inside it.
// This is complex, I will write the replacement manually using multi_replace_file_content or a script to inject.
fs.writeFileSync(file, content);
console.log('Builder page modified partially.');
