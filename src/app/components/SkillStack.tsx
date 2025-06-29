'use client';

import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

// This is a new, separate component for the item being dragged
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
  } = useSortable({ id: action.skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  function handleDragStart(event: any) {
    const { active } = event;
    const action = queue.find(item => item.skill.id === active.id);
    setActiveAction(action);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveAction(null); // Clear the active item after drag ends

    // This logic should now work correctly with the new collision strategy.
    if (active && !over) {
      const oldIndex = queue.findIndex(item => item.skill.id === active.id);
      if (oldIndex > -1) {
        onRemove(oldIndex);
      }
      return;
    }

    if (over && active.id !== over.id) {
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
        // --- UPDATED: Switched to rectIntersection for collision detection ---
        collisionDetection={rectIntersection} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={queue.map(item => item.skill.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 items-center justify-center min-h-[80px]">
            {queue.length > 0 ? queue.map((action) => (
              <SortableSkill key={action.skill.id} action={action} />
            )) : (
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
