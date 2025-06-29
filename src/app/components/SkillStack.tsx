'use client';

import { useState, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

// This is a new, separate component for the item's visual representation.
// It will be used for both the static item in the list and the floating overlay.
function SkillItem({ action }: { action: any }) {
    return (
        <div className="w-16 h-16 bg-gray-700 rounded-md border-2 border-blue-500 flex items-center justify-center text-white font-bold text-xs p-1 text-center">
            {action.caster.imageUrl ? (
            <Image src={action.caster.imageUrl} alt={action.skill.name} width={64} height={64} className="rounded-md object-cover" />
            ) : (
            action.skill.name
            )}
        </div>
    );
}


// Individual item in the stack
function SortableSkill({ action }: { action: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // dnd-kit provides this to know when an item is being dragged
  } = useSortable({ id: action.skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // --- FIX: Hide the original item while it's being dragged ---
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative touch-none flex-shrink-0">
        <SkillItem action={action} />
    </div>
  );
}


// The main SkillStack component
export default function SkillStack({ queue, onReorder, onRemove }: { queue: any[], onReorder: (oldIndex: number, newIndex: number) => void, onRemove: (index: number) => void }) {
  const [activeAction, setActiveAction] = useState<any | null>(null);
  const [removingId, setRemovingId] = useState<any | null>(null);
  
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));
  
  // This effect is a good practice for cleanup. It ensures that if the 
  // queue prop updates from the parent component, our temporary 'removingId' 
  // state is cleared, keeping the UI consistent.
  useEffect(() => {
    if (removingId && !queue.find(item => item.skill.id === removingId)) {
        setRemovingId(null);
    }
  }, [queue, removingId]);


  function handleDragStart(event: any) {
    const { active } = event;
    // Store the full action object of the item being dragged
    const action = queue.find(item => item.skill.id === active.id);
    setActiveAction(action);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveAction(null); // Clear the active item after drag ends

    // If 'over' is null, the item was dropped outside a valid target.
    if (active && !over) {
      // By setting the removingId, we trigger an immediate re-render
      // to hide the item, preventing the "snap back" animation.
      setRemovingId(active.id);

      const oldIndex = queue.findIndex(item => item.skill.id === active.id);
      if (oldIndex > -1) {
        onRemove(oldIndex);
      }
      return;
    }

    // Handle reordering
    if (over && active.id !== over.id) {
      // When reordering successfully, ensure we clear any stale removingId
      setRemovingId(null);
      const oldIndex = queue.findIndex(item => item.skill.id === active.id);
      const newIndex = queue.findIndex(item => item.skill.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center">Skill Stack</h3>
      <DndContext 
        sensors={sensors} 
        collisionDetection={rectIntersection} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={queue.map(item => item.skill.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 items-center justify-center min-h-[80px]">
            {queue.length > 0 ? queue.map((action) => {
              // If an item is marked for removal, don't render it.
              if (action.skill.id === removingId) return null;
              return <SortableSkill key={action.skill.id} action={action} />
            }) : (
              <p className="text-gray-500">Click a skill and target to add to the stack.</p>
            )}
          </div>
        </SortableContext>
        
        {/* This overlay renders the "floating" component while dragging */}
        <DragOverlay>
          {activeAction ? <SkillItem action={activeAction} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}