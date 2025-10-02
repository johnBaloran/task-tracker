import { useState, useEffect, useRef } from "react";

interface TaskCardEditProps {
  initialTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

/**
 * SINGLE RESPONSIBILITY: Handle task editing only
 *
 * UX ENHANCEMENTS:
 * - Auto-focus input (useRef + useEffect)
 * - Keyboard shortcuts (Enter to save, Escape to cancel)
 * - Input validation (prevent empty titles)
 * - Clear error messaging
 *
 * ACCESSIBILITY:
 * - Focus management for keyboard users
 * - Clear button labels
 * - Error feedback
 */
export function TaskCardEdit({
  initialTitle,
  onSave,
  onCancel,
}: TaskCardEditProps) {
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // EFFECT PATTERN: Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
    // Optional chaining (?.) prevents crash if ref is null
  }, []);

  const handleSave = () => {
    const trimmedTitle = title.trim();

    // VALIDATION: Guard clause pattern
    if (!trimmedTitle) {
      alert("Task title cannot be empty");
      return;
    }

    if (trimmedTitle === initialTitle) {
      // No changes made, just cancel
      onCancel();
      return;
    }

    onSave(trimmedTitle);
  };

  // KEYBOARD ACCESSIBILITY
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Edit task title"
        placeholder="Task title"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Save changes"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Cancel editing"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
