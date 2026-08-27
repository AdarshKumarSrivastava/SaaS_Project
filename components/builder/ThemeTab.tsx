import React from 'react';

interface ThemeTabProps {
  theme: any;
  updateTheme: (theme: any) => void;
}

export function ThemeTab({ theme, updateTheme }: ThemeTabProps) {
  
  const handleColorChange = (key: string, value: string) => {
    updateTheme({ ...theme, colors: { ...theme?.colors, [key]: value } });
  };

  const handleTypographyChange = (key: string, value: string) => {
    updateTheme({ ...theme, typography: { ...theme?.typography, [key]: value } });
  };

  const handleLayoutChange = (key: string, value: string) => {
    updateTheme({ ...theme, layout: { ...theme?.layout, [key]: value } });
  };

  return (
    <div className="space-y-6 pb-32">
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1 pb-2">
        Global Theme Settings
      </div>

      {/* Colors */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/10 pb-3">Colors</h3>
        
        <div className="space-y-3">
          {['background', 'foreground', 'primary', 'accent'].map(colorKey => (
            <div key={colorKey} className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-white/60 capitalize">{colorKey}</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={theme?.colors?.[colorKey] || ''}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  className="bg-[#1A1A1A] border border-white/10 rounded px-2 py-1 text-xs w-20 text-center focus:outline-none"
                />
                <input 
                  type="color" 
                  value={theme?.colors?.[colorKey] || '#000000'}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/10 pb-3">Typography</h3>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Heading Font</label>
            <input 
              type="text" 
              value={theme?.typography?.headingFont || ''}
              onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
              placeholder="e.g. Playfair Display"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Body Font</label>
            <input 
              type="text" 
              value={theme?.typography?.bodyFont || ''}
              onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
              placeholder="e.g. Inter"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/10 pb-3">Layout</h3>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Container Width</label>
            <input 
              type="text" 
              value={theme?.layout?.containerWidth || ''}
              onChange={(e) => handleLayoutChange('containerWidth', e.target.value)}
              placeholder="e.g. 1400px"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Base Spacing</label>
            <input 
              type="text" 
              value={theme?.layout?.spacing || ''}
              onChange={(e) => handleLayoutChange('spacing', e.target.value)}
              placeholder="e.g. 1rem"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
