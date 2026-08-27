import * as fs from 'fs';
const file = 'components/builder/ProductsTab.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '<div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-5">',
  '<div className="editor-section bg-[#111] border border-white/10 rounded-xl overflow-hidden flex flex-col">\n          <div className="section-header px-5 py-4 bg-white/[0.02] border-b border-white/5">\n            <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Product Details</h3>\n          </div>\n          <div className="section-content p-5 space-y-5">'
);
content = content.replace('            />\n          </div>\n        </div>', '            />\n          </div>\n        </div>\n        </div>');
fs.writeFileSync(file, content);
