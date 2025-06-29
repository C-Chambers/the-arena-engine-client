'use client';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Individual item in the stack
function SortableSkill({ action, onRemove }: { action: any, onRemove: () => void }) {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative touch-none">
      <div className="w-16 h-16 bg-gray-700 rounded-md border-2 border-blue-500 flex items-center justify-center text-white font-bold text-xs p-1 text-center">
        {action.skill.name}
      </div>
      <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center">
        X
      </button>
    </div>
  );
}


// The main SkillStack component
export default function SkillStack({ queue, onReorder, onRemove }: { queue: any[], onReorder: (oldIndex: number, newIndex: number) => void, onRemove: (index: number) => void }) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: any) {
    const { active, over } = event;
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
        <SortableContext items={queue.map(item => item.skill.id)} strategy={rectSortingStrategy}>
          <div className="flex gap-4 items-center justify-center min-h-[80px]">
            {queue.length > 0 ? queue.map((action, index) => (
              <SortableSkill key={action.skill.id} action={action} onRemove={() => onRemove(index)} />
            )) : (
              <p className="text-gray-500">Click a skill and target to add to the stack.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
