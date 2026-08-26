import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, 'app/sites/[siteId]/builder/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const rightPanelStart = content.indexOf('{/* RIGHT PANEL - Wizard Editor */}');
if (rightPanelStart === -1) throw new Error('Could not find right panel start');

const newRightPanel = `{/* RIGHT PANEL - Universal Editor */}
      <div className="relative z-10 w-[420px] h-full p-6 flex flex-col shrink-0">
         
         <div className="flex items-center justify-between mb-4 shrink-0">
            <button onClick={() => router.push('/dashboard')} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
               <ArrowLeft className="w-3 h-3" /> Exit
            </button>
            <div className="flex items-center gap-2">
               <button onClick={undo} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 disabled:opacity-30 hover:bg-neutral-200 transition">
                  <Undo className="w-3.5 h-3.5" />
               </button>
               <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 disabled:opacity-30 hover:bg-neutral-200 transition">
                  <Redo className="w-3.5 h-3.5" />
               </button>
               <button 
                  onClick={() => handleSave()} 
                  disabled={saving}
                  className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ml-2"
               >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
               </button>
            </div>
         </div>

         {/* The Editor Panel */}
         <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-lg relative z-10">
            
            {/* Tab Navigation */}
            <div className="shrink-0 p-2 border-b border-neutral-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">
               <div className="flex bg-neutral-100 dark:bg-black/40 rounded-full p-1">
                  <button onClick={() => setActiveTab('pages')} className={\`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all \${activeTab === 'pages' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}\`}>
                     <FileText className="w-3 h-3" /> Pages
                  </button>
                  <button onClick={() => setActiveTab('theme')} className={\`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all \${activeTab === 'theme' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}\`}>
                     <Paintbrush className="w-3 h-3" /> Theme
                  </button>
                  <button onClick={() => setActiveTab('navigation')} className={\`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all \${activeTab === 'navigation' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}\`}>
                     <Navigation className="w-3 h-3" /> Nav
                  </button>
               </div>
            </div>

            <div 
               data-lenis-prevent="true"
               className="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden custom-scrollbar pointer-events-auto overscroll-contain p-6"
            >
               <AnimatePresence mode="wait">
                  {activeTab === 'pages' && (
                     <motion.div key="pages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
                        
                        {/* Page Selector */}
                        <div className="bg-neutral-50 dark:bg-black/20 p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                           <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Editing Page</label>
                           <select 
                              value={currentStepIndex}
                              onChange={(e) => {
                                 setCurrentStepIndex(Number(e.target.value));
                                 router.replace(\`?page=\${siteData.pages[Number(e.target.value)].id}\`, { scroll: false });
                              }}
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none"
                           >
                              {siteData.pages.map((p, idx) => (
                                 <option key={p.id} value={idx}>{p.name} ({p.path})</option>
                              ))}
                           </select>
                        </div>

                        {/* Sections Editor */}
                        <div className="space-y-8">
                           {activePage.sections.map((section, sIdx) => (
                              <div key={section.id} className="relative group">
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className="flex flex-col gap-1">
                                       <div className="w-4 h-[1px] bg-neutral-300 dark:bg-white/20" />
                                       <div className="w-2 h-[1px] bg-neutral-200 dark:bg-white/10" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-[0.3em] font-mono">
                                       {section.type} <span className="text-neutral-400 dark:text-white/20">BLOCK</span>
                                    </h3>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" />
                                 </div>
                                 <SchemaRenderer 
                                    section={section} 
                                    onChange={(key, value) => updateSectionProp(section.id, key, value)} 
                                 />
                              </div>
                           ))}
                        </div>
                     </motion.div>
                  )}

                  {activeTab === 'theme' && (
                     <motion.div key="theme" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20 text-center text-neutral-500 mt-10">
                        <Paintbrush className="w-8 h-8 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Theme schema integration coming in Phase 3</p>
                     </motion.div>
                  )}

                  {activeTab === 'navigation' && (
                     <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20 text-center text-neutral-500 mt-10">
                        <Navigation className="w-8 h-8 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Navigation integration coming in Phase 3</p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}`;

content = content.substring(0, rightPanelStart) + newRightPanel;
fs.writeFileSync(file, content);
console.log('Right panel rewritten completely.');
