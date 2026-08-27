"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCustomizationContext } from '@/context/CustomizationContext';

interface OverlayState {
  rect: { top: number; left: number; width: number; height: number };
  tag: string;
  fieldKey: string | null;
  sectionId: string | null;
}

export function BuilderOverlay() {
  const [hoverState, setHoverState] = useState<OverlayState | null>(null);
  const [selectedState, setSelectedState] = useState<OverlayState | null>(null);
  
  const hoveredElementRef = useRef<HTMLElement | null>(null);
  const selectedElementRef = useRef<HTMLElement | null>(null);
  const selectedKeyRef = useRef<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const __customContext = useCustomizationContext();

  const calculateOverlayRect = useCallback((el: HTMLElement): OverlayState | null => {
    const container = document.getElementById('preview-scroll-container');
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();

    return {
      rect: {
        top: elementRect.top - containerRect.top + container.scrollTop,
        left: elementRect.left - containerRect.left + container.scrollLeft,
        width: elementRect.width,
        height: elementRect.height
      },
      tag: el.tagName.toLowerCase(),
      fieldKey: el.getAttribute('data-field-key'),
      sectionId: el.getAttribute('data-section-id'),
    };
  }, []);

  const updateSelectedState = useCallback(() => {
    if (selectedElementRef.current && document.body.contains(selectedElementRef.current)) {
      setHoverState(null); // Hide hover when selected is updated to prevent overlap confusion
      setSelectedState(calculateOverlayRect(selectedElementRef.current));
    } else if (selectedKeyRef.current) {
      // Try to re-resolve the element if it was re-rendered (stale ref)
      const el = document.querySelector(`[data-field-key="${selectedKeyRef.current}"]`) || 
                 document.querySelector(`[data-section-id="${selectedKeyRef.current}"]`);
      if (el) {
        selectedElementRef.current = el as HTMLElement;
        setSelectedState(calculateOverlayRect(selectedElementRef.current));
      } else {
        setSelectedState(null);
      }
    } else {
      setSelectedState(null);
    }
  }, [calculateOverlayRect]);

  const updateHoverState = useCallback(() => {
    if (hoveredElementRef.current && document.body.contains(hoveredElementRef.current)) {
      // Don't show hover over the selected element
      if (hoveredElementRef.current === selectedElementRef.current) {
        setHoverState(null);
        return;
      }
      setHoverState(calculateOverlayRect(hoveredElementRef.current));
    } else {
      setHoverState(null);
    }
  }, [calculateOverlayRect]);

  useEffect(() => {
    if (typeof window === 'undefined' || !__customContext?.isBuilderContext) return;

    // Resize Observer for the selected element
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateSelectedState();
        updateHoverState();
      });
    });

    const observeElement = (el: HTMLElement | null) => {
      if (el) resizeObserver.observe(el);
    };

    const unobserveElement = (el: HTMLElement | null) => {
      if (el) resizeObserver.unobserve(el);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'builder-overlay-svg' || target.closest('#builder-overlay-svg')) return;

      const editableTarget = target.closest('[data-field-key]') || target.closest('[data-section-id]');
      
      if (editableTarget) {
        if (hoveredElementRef.current !== editableTarget) {
          unobserveElement(hoveredElementRef.current);
          hoveredElementRef.current = editableTarget as HTMLElement;
          observeElement(hoveredElementRef.current);
        }
        updateHoverState();
      } else {
        unobserveElement(hoveredElementRef.current);
        hoveredElementRef.current = null;
        setHoverState(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!hoveredElementRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();

      const el = hoveredElementRef.current;
      const fieldKey = el.getAttribute('data-field-key');
      const sectionId = el.getAttribute('data-section-id');
      
      const payload = {
        type: 'ELEMENT_SELECTED',
        fieldKey,
        sectionId,
        pageId: el.getAttribute('data-page-id'),
        componentId: el.getAttribute('data-component-id'),
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim(),
        src: el.getAttribute('src'),
        rect: calculateOverlayRect(el)?.rect
      };

      selectedKeyRef.current = fieldKey || sectionId;
      unobserveElement(selectedElementRef.current);
      selectedElementRef.current = el;
      observeElement(selectedElementRef.current);
      
      updateSelectedState();
      window.parent.postMessage(payload, '*');
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CLEAR_SELECTION') {
        selectedKeyRef.current = null;
        unobserveElement(selectedElementRef.current);
        selectedElementRef.current = null;
        setSelectedState(null);
      } else if (e.data?.type === 'FOCUS_ELEMENT') {
        const { fieldKey, sectionId } = e.data;
        selectedKeyRef.current = fieldKey || sectionId;
        
        const el = (fieldKey ? document.querySelector(`[data-field-key="${fieldKey}"]`) : null) 
                 || (sectionId ? document.querySelector(`[data-section-id="${sectionId}"]`) : null);
                 
        if (el) {
          unobserveElement(selectedElementRef.current);
          selectedElementRef.current = el as HTMLElement;
          observeElement(selectedElementRef.current);
          updateSelectedState();
        }
      } else if (e.data?.type === 'UPDATE_SCHEMA') {
        // Data changed (e.g. typing in editor), layout might shift. Recalculate next frame.
        requestAnimationFrame(() => {
          updateSelectedState();
        });
      }
    };

    // Scroll listener on the preview container
    const scrollContainer = document.getElementById('preview-scroll-container');
    const handleScroll = () => {
      requestAnimationFrame(() => {
        updateSelectedState();
        updateHoverState();
      });
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Also observe the entire body to catch any layout shifts that ResizeObserver on single elements might miss
    const bodyObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateSelectedState();
        updateHoverState();
      });
    });
    bodyObserver.observe(document.body);

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('message', handleMessage);

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      bodyObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('message', handleMessage);
    };
  }, [__customContext?.isBuilderContext, calculateOverlayRect, updateHoverState, updateSelectedState]);

  if (!hoverState && !selectedState) return null;

  return (
    <div 
      ref={containerRef}
      id="builder-overlay-svg"
      style={{
        position: 'absolute', // Absolute to the preview-scroll-container (which contains this React tree)
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    >
      {/* HOVER STATE (Subtle) */}
      {hoverState && !selectedState && (
        <div
          style={{
            position: 'absolute',
            top: hoverState.rect.top,
            left: hoverState.rect.left,
            width: hoverState.rect.width,
            height: hoverState.rect.height,
            border: '2px solid rgba(0, 85, 255, 0.4)',
            backgroundColor: 'rgba(0, 85, 255, 0.05)',
            pointerEvents: 'none',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      )}

      {/* SELECTED STATE (Prominent) */}
      {selectedState && (
        <div
          style={{
            position: 'absolute',
            top: selectedState.rect.top,
            left: selectedState.rect.left,
            width: selectedState.rect.width,
            height: selectedState.rect.height,
            border: '2px solid #0055FF',
            backgroundColor: 'rgba(0, 85, 255, 0.02)',
            boxShadow: '0 0 0 2px rgba(0, 85, 255, 0.1), 0 0 15px rgba(0, 85, 255, 0.1)',
            pointerEvents: 'none',
            borderRadius: '4px',
            boxSizing: 'border-box',
            transition: 'top 0.15s ease-out, left 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              // Place label inside if too close to top edge, otherwise place it outside above
              top: selectedState.rect.top < 24 ? '0px' : '-24px',
              left: '-2px',
              backgroundColor: '#0055FF',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: selectedState.rect.top < 24 ? '0 0 4px 0' : '4px 4px 4px 0',
              fontFamily: 'system-ui, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap'
            }}
          >
            {selectedState.fieldKey ? selectedState.fieldKey.split('.').pop() : selectedState.sectionId || selectedState.tag}
          </div>
        </div>
      )}
    </div>
  );
}
