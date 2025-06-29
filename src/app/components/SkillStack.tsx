'use client';

import { useState, useEffect } from 'react';
// --- CHANGED: Import 'closestCenter' instead of 'rectIntersection' ---
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

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

function SortableSkill({ action }: { action: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
  
  const { setNodeRef } = useDroppable({
    id: 'skill-stack-container',
  });

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));
  
  useEffect(() => {
    if (removingId && !queue.find(item => item.skill.id === removingId)) {
        setRemovingId(null);
    }
  }, [queue, removingId]);


  function handleDragStart(event: any) {
    const { active } = event;
    const action = queue.find(item => item.skill.id === active.id);
    setActiveAction(action);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveAction(null);

    if (active && !over) {
      setRemovingId(active.id);
      const oldIndex = queue.findIndex(item => item.skill.id === active.id);
      if (oldIndex > -1) {
        onRemove(oldIndex);
      }
      return;
    }

    if (over && active.id !== over.id) {
        if (queue.some(item => item.skill.id === over.id)) {
            setRemovingId(null);
            const oldIndex = queue.findIndex(item => item.skill.id === active.id);
            const newIndex = queue.findIndex(item => item.skill.id === over.id);
            onReorder(oldIndex, newIndex);
        }
    }
  }

  return (
    <div ref={setNodeRef} className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center">Skill Stack</h3>
      <DndContext 
        sensors={sensors} 
        // --- THE FIX: Use 'closestCenter' for more accurate collision detection in this layout ---
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={queue.map(item => item.skill.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 items-center justify-center min-h-[80px]">
            {queue.length > 0 ? queue.map((action) => {
              if (action.skill.id === removingId) return null;
              return <SortableSkill key={action.skill.id} action={action} />
            }) : (
              <p className="text-gray-500">Click a skill and target to add to the stack.</p>
            )}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeAction ? <SkillItem action={activeAction} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}