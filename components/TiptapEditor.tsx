'use client';

import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { captureService } from '@/services/capture.service';
import { Box, Text } from '@chakra-ui/react';

// 1. Custom Mention Extension Suggestion Configuration
const suggestion = {
  items: async ({ query }: { query: string }) => {
    // Get orgId from localStorage on client side
    if (typeof window === 'undefined') return [];
    
    const orgId = localStorage.getItem('orgId');
    if (!orgId) return [];
    
    try {
      const res = await captureService.getCaptures(orgId, undefined, 10);
      const data = await res.json();
      const items = data.content || [];
      return items
        .filter((item: any) => item.id.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to fetch captures for mentions:', error);
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer;
    let popup: TippyInstance[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return (component.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

// 2. Mention List Component (Internal)
const MentionList = (props: any) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: `Capture #${item.id.slice(-4)}` });
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  props.ref.current = {
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] animate-in fade-in zoom-in-95 duration-200">
      {props.items.length ? (
        <div className="p-2 space-y-1">
          {props.items.map((item: any, index: number) => (
            <button
              key={item.id}
              onClick={() => selectItem(index)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center space-x-3 transition-colors ${
                index === selectedIndex ? 'bg-navy-950 text-white' : 'text-navy-600 hover:bg-navy-50'
              }`}
            >
              <img src={item.contactImageUrl || '/placeholder-image.png'} alt="" className="w-8 h-8 rounded-lg object-cover ring-2 ring-navy-50" />
              <div className="flex flex-col">
                <span className="font-bold">CAP-{item.id.slice(-6).toUpperCase()}</span>
                <span className={`text-[10px] ${index === selectedIndex ? 'text-white/60' : 'text-gray-400'}`}>Protocol Reference</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 text-xs text-gray-400 italic text-center">No entities found</div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';

export default function TiptapEditor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-navy-50 text-navy-950 font-black px-2 py-0.5 rounded-lg border border-navy-100 cursor-pointer hover:bg-navy-100 transition-all text-xs mx-0.5',
        },
        suggestion,
      }),
    ],
    content: '<p>Initiate research documentation here. Type <strong>@</strong> to reference established protocol captures.</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] px-8 py-6 text-navy-900',
      },
    },
    // Avoid SSR hydration mismatches per Tiptap guidance
    immediatelyRender: false,
  });

  if (!mounted) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-3 border-b border-gray-100 flex items-center gap-1">
          <div className="w-16 h-8 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-100 rounded-xl animate-pulse ml-2"></div>
          <div className="flex-1"></div>
          <div className="w-32 h-4 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="min-h-[300px] px-8 py-6">
          <div className="h-4 bg-gray-100 rounded animate-pulse mb-4"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="bg-white/80 backdrop-blur-sm px-6 py-3 border-b border-gray-100 flex items-center gap-1">
        {/* Basic formatting buttons */}
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          className={`px-3 py-1.5 rounded-xl transition-all font-black text-sm uppercase tracking-widest ${
            editor?.isActive('bold') ? 'bg-navy-950 text-white shadow-lg shadow-navy-900/20' : 'text-navy-400 hover:bg-navy-50'
          }`}
        >
          Bold
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleItalic().run()} 
          className={`px-3 py-1.5 rounded-xl transition-all font-black text-sm uppercase tracking-widest italic ${
            editor?.isActive('italic') ? 'bg-navy-950 text-white shadow-lg shadow-navy-900/20' : 'text-navy-400 hover:bg-navy-50'
          }`}
        >
          Italic
        </button>
        
        <Box className="w-[1px] h-6 bg-gray-100 mx-2"></Box>
        
        <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-200 ml-auto">Sync Status: Real-time</Text>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
