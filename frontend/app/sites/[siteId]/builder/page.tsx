"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  LayoutTemplate, Image as ImageIcon, Mail, Settings, Save, GripVertical, Trash2, ArrowLeft, Loader2,
  DollarSign, MessageSquare, HelpCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { BlockType, Section, RenderBlock } from '@/components/builder/Registry';

// --- SORTABLE WRAPPER ---
 
const SortableSection = ({ section, isSelected, onSelect, onDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group rounded-2xl transition-all ${isSelected ? 'ring-2 ring-ink' : 'hover:ring-1 hover:ring-line'}`}
      onClick={(e) => { e.stopPropagation(); onSelect(section); }}
    >
      {/* Drag Handle & Actions */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div {...attributes} {...listeners} className="p-2 bg-bg-elevated text-ink rounded-lg cursor-grab active:cursor-grabbing hover:bg-bg-subtle border border-line shadow-sm">
          <GripVertical className="w-4 h-4" />
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(section.id); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 shadow-sm">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className={isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 transition-opacity'}>
        <RenderBlock section={section} />
      </div>
    </div>
  );
};


export default function BuilderPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const data = await apiClient.get(`http://localhost:3001/api/sites/${siteId}`);
        if (data.schema && Array.isArray(data.schema)) {
          setSections(data.schema);
        } else {
          setSections([]);
        }
      } catch (err) {
        console.error(err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`http://localhost:3001/api/sites/${siteId}/schema`, {
        schema: sections
      });
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: BlockType) => {
    let defaultProps = {};
    if (type === 'Hero') defaultProps = { headline: 'Welcome to my site', subheadline: 'We build amazing things.', buttonText: 'Get Started' };
    if (type === 'Gallery') defaultProps = { 
      title: 'Our Work',
      image1: 'https://ik.imagekit.io/demo/img/image1.jpeg',
      image2: 'https://ik.imagekit.io/demo/img/image2.jpeg',
      image3: 'https://ik.imagekit.io/demo/img/image3.jpg'
    };
    if (type === 'Contact') defaultProps = { title: 'Contact Us', buttonText: 'Send Message' };
    if (type === 'Pricing') defaultProps = { tier1Name: 'Starter', tier1Price: '$9', tier2Name: 'Professional', tier2Price: '$29' };
    if (type === 'Testimonial') defaultProps = { quote: 'This product is magical.', authorName: 'Jane Doe', authorRole: 'Founder' };
    if (type === 'FAQ') defaultProps = { question1: 'How does it work?', answer1: 'Magic.', question2: 'Is it free?', answer2: 'Yes.' };
    
    const newSection: Section = {
      id: uuidv4(),
      type,
      props: defaultProps
    };
    
    setSections([...sections, newSection]);
    setSelectedId(newSection.id);
  };

  const deleteBlock = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSelectedProp = (key: string, value: string) => {
    setSections(sections.map(s => {
      if (s.id === selectedId) {
        return { ...s, props: { ...s.props, [key]: value } };
      }
      return s;
    }));
  };

  const selectedSection = sections.find(s => s.id === selectedId);

  if (loading) return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
        <span className="text-sm text-ink-soft">Loading builder...</span>
      </div>
    </div>
  );

  const blockItems = [
    { type: 'Hero' as BlockType, label: 'Hero Section', icon: LayoutTemplate, accent: 'bg-blue-50 text-blue-600 border-blue-100' },
    { type: 'Gallery' as BlockType, label: 'Image Gallery', icon: ImageIcon, accent: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { type: 'Contact' as BlockType, label: 'Contact Form', icon: Mail, accent: 'bg-purple-50 text-purple-600 border-purple-100' },
  ];

  const advancedItems = [
    { type: 'Pricing' as BlockType, label: 'Pricing Table', icon: DollarSign, accent: 'bg-amber-50 text-amber-600 border-amber-100' },
    { type: 'Testimonial' as BlockType, label: 'Testimonial', icon: MessageSquare, accent: 'bg-pink-50 text-pink-600 border-pink-100' },
    { type: 'FAQ' as BlockType, label: 'FAQ Accordion', icon: HelpCircle, accent: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  ];

  return (
    <div className="h-screen bg-bg-base text-ink flex overflow-hidden">
      
      {/* LEFT SIDEBAR - Blocks */}
      <div className="w-64 border-r border-line bg-bg-elevated flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-line flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-bg-subtle rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-ink-soft" />
          </button>
          <span className="font-semibold text-sm">Builder</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-3">Core Elements</h3>
          <div className="space-y-2 mb-6">
            {blockItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.type} onClick={() => addBlock(item.type)} className="w-full flex items-center gap-3 p-3.5 bg-bg-base hover:bg-bg-subtle border border-line rounded-xl transition-all hover:shadow-sm">
                  <div className={`p-2 rounded-lg border ${item.accent}`}><Icon className="w-3.5 h-3.5" /></div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          <h3 className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-3">Advanced</h3>
          <div className="space-y-2">
            {advancedItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.type} onClick={() => addBlock(item.type)} className="w-full flex items-center gap-3 p-3.5 bg-bg-base hover:bg-bg-subtle border border-line rounded-xl transition-all hover:shadow-sm">
                  <div className={`p-2 rounded-lg border ${item.accent}`}><Icon className="w-3.5 h-3.5" /></div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div className="flex-1 flex flex-col h-full relative" onClick={() => setSelectedId(null)}>
        
        {/* Canvas Header */}
        <div className="h-14 border-b border-line flex items-center justify-end px-6 bg-bg-elevated/70 backdrop-blur-xl absolute top-0 w-full z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            disabled={saving}
            className="bg-ink text-bg-elevated px-5 py-2 rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 pt-22 bg-bg-subtle">
          <div className="max-w-4xl mx-auto space-y-6 min-h-[50vh]">
            {sections.length === 0 ? (
              <div className="h-64 border border-dashed border-line rounded-2xl flex items-center justify-center text-ink-soft bg-bg-elevated">
                Click a block in the sidebar to add it to your canvas.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map(section => (
                    <SortableSection 
                      key={section.id} 
                      section={section} 
                      isSelected={selectedId === section.id}
                      onSelect={(s: Section) => setSelectedId(s.id)}
                      onDelete={deleteBlock}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Properties */}
      <div className="w-80 border-l border-line bg-bg-elevated flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-line flex items-center gap-2 text-ink-soft">
          <Settings className="w-4 h-4" />
          <span className="font-semibold text-sm">Properties</span>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {!selectedSection ? (
            <div className="text-center text-ink-soft mt-10 text-sm">
              Select a block on the canvas to edit its properties.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="inline-block px-3 py-1 bg-bg-subtle border border-line rounded-full text-xs font-semibold text-ink">
                {selectedSection.type} Block
              </div>
              
              {/* Dynamic Property Inputs based on type */}
              {Object.keys(selectedSection.props).map(propKey => (
                <div key={propKey}>
                  <label className="block text-xs font-medium text-ink-soft mb-1.5 capitalize">{propKey.replace(/([A-Z])/g, ' $1')}</label>
                  <input 
                    type="text" 
                    value={selectedSection.props[propKey]}
                    onChange={(e) => updateSelectedProp(propKey, e.target.value)}
                    className="w-full bg-bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
