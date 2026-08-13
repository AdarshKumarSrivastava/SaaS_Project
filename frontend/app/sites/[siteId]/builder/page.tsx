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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      className={`relative group rounded-2xl transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-white/30'}`}
      onClick={(e) => { e.stopPropagation(); onSelect(section); }}
    >
      {/* Drag Handle & Actions */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div {...attributes} {...listeners} className="p-2 bg-black/80 text-white rounded-lg cursor-grab active:cursor-grabbing hover:bg-zinc-800 border border-white/10 backdrop-blur">
          <GripVertical className="w-4 h-4" />
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(section.id); }} className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 border border-red-500/50 backdrop-blur">
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      
      {/* LEFT SIDEBAR - Blocks */}
      <div className="w-64 border-r border-white/10 bg-zinc-950 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-medium">Builder</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Core Elements</h3>
          <div className="space-y-3 mb-8">
            <button onClick={() => addBlock('Hero')} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:-translate-y-0.5">
              <div className="bg-blue-500/20 p-2 rounded-lg"><LayoutTemplate className="w-4 h-4 text-blue-400" /></div>
              <span className="font-medium text-sm">Hero Section</span>
            </button>
            
            <button onClick={() => addBlock('Gallery')} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:-translate-y-0.5">
              <div className="bg-emerald-500/20 p-2 rounded-lg"><ImageIcon className="w-4 h-4 text-emerald-400" /></div>
              <span className="font-medium text-sm">Image Gallery</span>
            </button>
            
            <button onClick={() => addBlock('Contact')} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:-translate-y-0.5">
              <div className="bg-purple-500/20 p-2 rounded-lg"><Mail className="w-4 h-4 text-purple-400" /></div>
              <span className="font-medium text-sm">Contact Form</span>
            </button>
          </div>

          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Advanced Elements</h3>
          <div className="space-y-3">
            <button onClick={() => addBlock('Pricing')} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:-translate-y-0.5">
              <div className="bg-amber-500/20 p-2 rounded-lg"><DollarSign className="w-4 h-4 text-amber-400" /></div>
              <span className="font-medium text-sm">Pricing Table</span>
            </button>

            <button onClick={() => addBlock('Testimonial')} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:-translate-y-0.5">
              <div className="bg-pink-500/20 p-2 rounded-lg"><MessageSquare className="w-4 h-4 text-pink-400" /></div>
              <span className="font-medium text-sm">Testimonial</span>
            </button>

            <button onClick={() => addBlock('FAQ')} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:-translate-y-0.5">
              <div className="bg-cyan-500/20 p-2 rounded-lg"><HelpCircle className="w-4 h-4 text-cyan-400" /></div>
              <span className="font-medium text-sm">FAQ Accordion</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER CANVAS - Dropzone & Render */}
      <div className="flex-1 flex flex-col h-full relative" onClick={() => setSelectedId(null)}>
        
        {/* Canvas Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-end px-6 bg-zinc-950/50 backdrop-blur absolute top-0 w-full z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            disabled={saving}
            className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 pt-24 bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto space-y-6 min-h-[50vh]">
            {sections.length === 0 ? (
              <div className="h-64 border border-dashed border-white/20 rounded-3xl flex items-center justify-center text-zinc-500">
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
      <div className="w-80 border-l border-white/10 bg-zinc-950 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center gap-2 text-zinc-400">
          <Settings className="w-4 h-4" />
          <span className="font-medium text-sm">Properties</span>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {!selectedSection ? (
            <div className="text-center text-zinc-500 mt-10 text-sm">
              Select a block on the canvas to edit its properties.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white mb-2">
                {selectedSection.type} Block
              </div>
              
              {/* Dynamic Property Inputs based on type */}
              {Object.keys(selectedSection.props).map(propKey => (
                <div key={propKey}>
                  <label className="block text-xs text-zinc-400 mb-2 capitalize">{propKey}</label>
                  <input 
                    type="text" 
                    value={selectedSection.props[propKey]}
                    onChange={(e) => updateSelectedProp(propKey, e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30"
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
