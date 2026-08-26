import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { COMPONENT_REGISTRY } from '@/lib/component-registry';

interface SchemaRendererProps {
  section: any;
  onChange: (key: string, value: any) => void;
}

export function SchemaRenderer({ section, onChange }: SchemaRendererProps) {
  // Find the explicit schema for this component type
  const schema = COMPONENT_REGISTRY[section.type];

  // If we have an explicit schema, render exactly what it dictates
  if (schema) {
    return (
      <div className="space-y-5 pl-7 border-l border-neutral-100 dark:border-white/5">
        {schema.fields.map(field => {
          const value = section.props[field.id] !== undefined ? section.props[field.id] : field.defaultValue || '';
          
          return (
            <div key={field.id} className="group/input">
              <label className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 dark:text-white/40 uppercase tracking-[0.2em] mb-2 group-focus-within/input:text-neutral-900 dark:group-focus-within/input:text-white transition-colors">
                <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-white/20 group-focus-within/input:bg-neutral-900 dark:group-focus-within/input:bg-white" />
                {field.label}
              </label>
              
              {field.type === 'text' && (
                <input 
                  type="text"
                  value={value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="w-full bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white/50 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white/50 transition-all shadow-sm"
                  placeholder={`Enter ${field.label}...`}
                />
              )}
              
              {field.type === 'textarea' && (
                <textarea 
                  value={value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="w-full bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white/50 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white/50 transition-all shadow-sm custom-scrollbar min-h-[80px] resize-y"
                  placeholder={`Enter ${field.label}...`}
                />
              )}

              {field.type === 'image' && (
                <div className="relative group/upload cursor-pointer border border-dashed border-neutral-300 dark:border-white/20 rounded-xl overflow-hidden hover:border-neutral-500 dark:hover:border-white/50 transition-all bg-neutral-50 dark:bg-black/40">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                             if (event.target?.result) {
                                onChange(field.id, event.target.result as string);
                             }
                          };
                          reader.readAsDataURL(file);
                       }
                    }}
                  />
                  <div className="p-6 flex flex-col items-center justify-center gap-3">
                    {value && (value.startsWith('data:image') || value.startsWith('http')) ? (
                       <div className="w-full h-32 relative rounded-lg overflow-hidden group-hover/upload:opacity-80 transition-opacity bg-neutral-100 dark:bg-black">
                          <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
                       </div>
                    ) : (
                       <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-white/5 flex items-center justify-center group-hover/upload:bg-neutral-300 dark:group-hover/upload:bg-white/10 text-neutral-500 dark:text-white/60 transition-all">
                          <ImageIcon className="w-5 h-5" />
                       </div>
                    )}
                    <div className="text-center relative z-20 pointer-events-none">
                       <p className="text-xs font-bold text-neutral-700 dark:text-white group-hover/upload:text-neutral-900 dark:group-hover/upload:text-white transition-colors flex items-center justify-center gap-2">
                          <Upload className="w-3 h-3" /> Click to upload image
                       </p>
                       <p className="text-[9px] text-neutral-400 dark:text-white/40 mt-1 uppercase tracking-widest">SVG, PNG, JPG or GIF</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback for custom components that don't have a strict schema registered yet.
  // This uses the old heuristic method to ensure forward-compatibility with any template.
  return (
    <div className="space-y-5 pl-7 border-l border-neutral-100 dark:border-white/5">
      {Object.keys(section.props).map(propKey => {
         const isImage = propKey.toLowerCase().includes('image') || propKey.toLowerCase().includes('logo');
         const isLongText = !isImage && section.props[propKey].length > 40;
         const value = section.props[propKey];
         
         return (
            <div key={propKey} className="group/input">
               <label className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 dark:text-white/40 uppercase tracking-[0.2em] mb-2 group-focus-within/input:text-neutral-900 dark:group-focus-within/input:text-white transition-colors">
                  <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-white/20 group-focus-within/input:bg-neutral-900 dark:group-focus-within/input:bg-white" />
                  {propKey.replace(/([A-Z])/g, ' $1').trim()}
               </label>
               {isImage ? (
                 <div className="relative group/upload cursor-pointer border border-dashed border-neutral-300 dark:border-white/20 rounded-xl overflow-hidden hover:border-neutral-500 dark:hover:border-white/50 transition-all bg-neutral-50 dark:bg-black/40">
                   <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                               if (event.target?.result) {
                                  onChange(propKey, event.target.result as string);
                               }
                            };
                            reader.readAsDataURL(file);
                         }
                      }}
                   />
                   <div className="p-6 flex flex-col items-center justify-center gap-3">
                      {value && (value.startsWith('data:image') || value.startsWith('http')) ? (
                         <div className="w-full h-32 relative rounded-lg overflow-hidden group-hover/upload:opacity-80 transition-opacity bg-neutral-100 dark:bg-black">
                            <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-white/5 flex items-center justify-center group-hover/upload:bg-neutral-300 dark:group-hover/upload:bg-white/10 text-neutral-500 dark:text-white/60 transition-all">
                            <ImageIcon className="w-5 h-5" />
                         </div>
                      )}
                      <div className="text-center relative z-20 pointer-events-none">
                         <p className="text-xs font-bold text-neutral-700 dark:text-white group-hover/upload:text-neutral-900 dark:group-hover/upload:text-white transition-colors flex items-center justify-center gap-2">
                            <Upload className="w-3 h-3" /> Click to upload image
                         </p>
                         <p className="text-[9px] text-neutral-400 dark:text-white/40 mt-1 uppercase tracking-widest">SVG, PNG, JPG or GIF</p>
                      </div>
                   </div>
                 </div>
               ) : isLongText ? (
                  <textarea 
                     value={value}
                     onChange={(e) => onChange(propKey, e.target.value)}
                     className="w-full bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white/50 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white/50 transition-all shadow-sm custom-scrollbar min-h-[80px] resize-y"
                     placeholder={`Enter ${propKey}...`}
                  />
               ) : (
                  <input 
                     type="text"
                     value={value}
                     onChange={(e) => onChange(propKey, e.target.value)}
                     className="w-full bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white/50 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white/50 transition-all shadow-sm"
                     placeholder={`Enter ${propKey}...`}
                  />
               )}
            </div>
         );
      })}
    </div>
  );
}
