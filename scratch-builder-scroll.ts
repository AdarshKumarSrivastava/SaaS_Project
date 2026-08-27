import * as fs from 'fs';
const file = 'app/sites/[siteId]/builder/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure root is h-[100dvh]
content = content.replace(
  '<div className="fixed inset-0 bg-[#050505] flex flex-col font-sans overflow-hidden text-white">',
  '<div className="fixed inset-0 h-[100dvh] bg-[#050505] flex flex-col font-sans overflow-hidden text-white">'
);

// Add editorScrollRef
content = content.replace(
  'const [saving, setSaving] = useState(false);',
  'const [saving, setSaving] = useState(false);\n  const editorScrollRef = useRef<HTMLDivElement>(null);'
);

// Pass editorScrollRef to RightSidebar
content = content.replace(
  'focusPreviewElement={focusPreviewElement}\n        />',
  'focusPreviewElement={focusPreviewElement}\n          editorScrollRef={editorScrollRef}\n        />'
);

// Wrap RightSidebar with the scroll container
content = content.replace(
  '{/* RIGHT SIDEBAR (25%) */}\n        <RightSidebar ',
  '{/* RIGHT SIDEBAR (25%) */}\n        <div ref={editorScrollRef} className="h-full overflow-y-auto overflow-x-hidden border-l border-white/10 shrink-0 custom-scrollbar z-40 bg-[#0A0A0A] relative">\n          <RightSidebar '
);
content = content.replace(
  '          editorScrollRef={editorScrollRef}\n        />',
  '          editorScrollRef={editorScrollRef}\n        />\n        </div>'
);

// Set up preview scroll container
content = content.replace(
  '<div className="w-full h-full relative" style={{ contain: \'layout size\' }}>\n              <TemplateRenderer',
  '<div id="preview-scroll-container" className="w-full h-full relative overflow-y-auto custom-scrollbar" style={{ contain: \'layout size\' }}>\n              <TemplateRenderer'
);

fs.writeFileSync(file, content);
