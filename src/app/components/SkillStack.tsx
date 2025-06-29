'use client';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

// Individual item in the stack
function SortableSkill({ action }: { action: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: action.skill.id }); // Use skill ID as the unique identifier

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // The onClick for removing the skill has been removed from the button
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative touch-none flex-shrink-0">
      <div className="w-16 h-16 bg-gray-700 rounded-md border-2 border-blue-500 flex items-center justify-center text-white font-bold text-xs p-1 text-center">
        {action.caster.imageUrl ? (
          <Image src={action.caster.imageUrl} alt={action.skill.name} width={64} height={64} className="rounded-md object-cover" />
        ) : (
          action.skill.name
        )}
      </div>
      {/* The 'X' button has been removed */}
    </div>
  );
}


// The main SkillStack component
export default function SkillStack({ queue, onReorder, onRemove }: { queue: any[], onReorder: (oldIndex: number, newIndex: number) => void, onRemove: (index: number) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, {
    // Require the mouse to move by 5 pixels before activating a drag
    activationConstraint: {
      distance: 5,
    },
  }));

  function handleDragEnd(event: any) {
    const { active, over } = event;

    // --- NEW: Logic to handle dragging out of the container ---
    // If 'over' is null, it means the item was dropped outside a valid target.
    if (active && !over) {
      const oldIndex = queue.findIndex(item => item.skill.id === active.id);
      onRemove(oldIndex);
      return;
    }

    // This is the existing logic for reordering within the stack.
    if (active.id !== over.id) {
      const oldIndex = queue.findIndex(item => item.skill.id === active.id);
      const newIndex = queue.findIndex(item => item.skill.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center">Skill Stack</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={queue.map(item => item.skill.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 items-center justify-center min-h-[80px]">
            {queue.length > 0 ? queue.map((action, index) => (
              <SortableSkill key={action.skill.id} action={action} />
            )) : (
              <p className="text-gray-500">Click a skill and target to add to the stack.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
