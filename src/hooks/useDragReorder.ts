import { useState, useCallback } from "react";

interface UseDragReorderOptions<T extends { id: string; sort_order: number }> {
  items: T[];
  onReorder: (items: T[]) => Promise<void>;
}

export function useDragReorder<T extends { id: string; sort_order: number }>({
  items,
  onReorder,
}: UseDragReorderOptions<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: T) => {
      e.dataTransfer.effectAllowed = "move";
      setDraggedItem(item);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();

      if (!draggedItem) return;

      const draggedIndex = items.findIndex((item) => item.id === draggedItem.id);
      if (draggedIndex === targetIndex) {
        setDraggedItem(null);
        setDragOverIndex(null);
        return;
      }

      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);

      // Update sort_order for all items
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        sort_order: index,
      }));

      setDraggedItem(null);
      setDragOverIndex(null);

      await onReorder(reorderedItems);
    },
    [draggedItem, items, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
