"use client";

import React, { useEffect, useState, useRef } from 'react';

interface HoverState {
  rect: DOMRect;
  tag: string;
  fieldKey: string | null;
  sectionId: string | null;
}

export function BuilderOverlay() {
  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run if we are in an iframe
    if (typeof window === 'undefined' || window.parent === window) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Find the closest editable element
      const target = e.target as HTMLElement;
      
      // Ignore clicks/hovers on the overlay itself just in case
      if (target.id === 'builder-overlay-svg' || target.closest('#builder-overlay-svg')) return;

      const editableTarget = target.closest('[data-field-key]') || target.closest('[data-section-id]');
      
      if (editableTarget) {
        const el = editableTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        
        setHoverState({
          rect,
          tag: el.tagName.toLowerCase(),
          fieldKey: el.getAttribute('data-field-key'),
          sectionId: el.getAttribute('data-section-id'),
        });
      } else {
        setHoverState(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!hoverState) return;
      
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const editableTarget = target.closest('[data-field-key]') || target.closest('[data-section-id]');
      
      if (editableTarget) {
        const el = editableTarget as HTMLElement;
        
        const payload = {
          type: 'ELEMENT_SELECTED',
          fieldKey: el.getAttribute('data-field-key'),
          sectionId: el.getAttribute('data-section-id'),
          pageId: el.getAttribute('data-page-id'),
          componentId: el.getAttribute('data-component-id'),
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim(),
          src: el.getAttribute('src'),
          rect: {
            top: el.getBoundingClientRect().top,
            left: el.getBoundingClientRect().left,
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height,
          }
        };

        setSelectedKey(payload.fieldKey || payload.sectionId);
        window.parent.postMessage(payload, '*');
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CLEAR_SELECTION') {
        setSelectedKey(null);
      } else if (e.data?.type === 'FOCUS_ELEMENT') {
        const { fieldKey, sectionId } = e.data;
        let targetEl: HTMLElement | null = null;
        
        if (fieldKey) {
          targetEl = document.querySelector(`[data-field-key="${fieldKey}"]`) as HTMLElement;
        } else if (sectionId) {
          targetEl = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement;
        }
        
        if (targetEl) {
          // Scroll iframe window to the element smoothly
          const rect = targetEl.getBoundingClientRect();
          const offset = window.scrollY + rect.top - 100;
          window.scrollTo({ top: offset, behavior: 'smooth' });
          
          // Apply temporary focus outline
          const originalOutline = targetEl.style.outline;
          const originalOutlineOffset = targetEl.style.outlineOffset;
          const originalTransition = targetEl.style.transition;
          
          targetEl.style.transition = 'outline 0.2s ease-in-out';
          targetEl.style.outline = '3px solid #0055FF';
          targetEl.style.outlineOffset = '2px';
          
          setTimeout(() => {
            if (targetEl) {
              targetEl.style.outline = originalOutline;
              targetEl.style.outlineOffset = originalOutlineOffset;
              setTimeout(() => {
                if (targetEl) targetEl.style.transition = originalTransition;
              }, 200);
            }
          }, 1500);
        }
      }
    };

    // Use capture phase to intercept clicks before React handles them
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('message', handleMessage);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('message', handleMessage);
    };
  }, [hoverState]);

  if (!hoverState) return null;

  return (
    <div 
      ref={containerRef}
      id="builder-overlay-svg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    >
      {hoverState && (
        <div
          style={{
            position: 'absolute',
            top: hoverState.rect.top,
            left: hoverState.rect.left,
            width: hoverState.rect.width,
            height: hoverState.rect.height,
            border: '2px solid #0055FF',
            backgroundColor: 'rgba(0, 85, 255, 0.05)',
            transition: 'all 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '-24px',
              left: '-2px',
              backgroundColor: '#0055FF',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '4px 4px 4px 0',
              fontFamily: 'system-ui, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap'
            }}
          >
            {hoverState.fieldKey ? hoverState.fieldKey.split('.').pop() : hoverState.sectionId || hoverState.tag}
          </div>
        </div>
      )}
    </div>
  );
}
