import React from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

function Modal() {
  return (
        <div 
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, overflow: 'hidden' }}
        >
          {/* Glassmorphic Translucent Backdrop */}
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, touchAction: 'none' }}
          />

          {/* Centered Viewport Wrapper (100% Fixed Centered) */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
            {/* Centered Responsive Viewport-Aware Modal Window */}
            <div
              id="modal-window"
              style={{ pointerEvents: 'auto', position: 'relative', width: '100%', maxWidth: '36rem', maxHeight: '85vh', backgroundColor: 'white', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Modal Fixed Header */}
              <div id="modal-header" style={{ padding: '24px', borderBottom: '1px solid #ccc', flexShrink: 0, backgroundColor: 'white' }}>
                Header
              </div>

              {/* Modal Internal Scrollable Form Area */}
              <div id="modal-content" style={{ padding: '24px', overflowY: 'auto', flex: 1, minHeight: 0, overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
                <div style={{ height: '1500px', background: 'linear-gradient(red, blue)' }}>
                  Tall Content
                </div>
              </div>

              {/* Modal Fixed Action Footer */}
              <div id="modal-footer" style={{ padding: '24px', borderTop: '1px solid #ccc', flexShrink: 0, backgroundColor: 'white' }}>
                Footer
              </div>
            </div>
          </div>
        </div>
  )
}

const root = createRoot(document.getElementById('root'));
root.render(<Modal />);
