import { useState } from "react";

interface UseDragAndDropReturn<T> {
  draggedIndex: number | null;
  items: T[];
  setItems: (items: T[]) => void;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, dropIndex: number) => void;
}

export function useDragAndDrop<T>(
  initialItems: T[],
  onOrderChange?: () => void
): UseDragAndDropReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Удаляем из старой позиции
    newItems.splice(draggedIndex, 1);
    // Вставляем в новую позицию
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(null);
    onOrderChange?.();
  };

  return {
    draggedIndex,
    items,
    setItems,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
