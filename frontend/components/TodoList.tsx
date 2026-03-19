"use client";

import { useState } from "react";
import type { Todo, UpdateTodoInput } from "../lib/api";

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
}

export function TodoList({ todos, onUpdate, onDelete, onToggle }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="text-sm text-slate-500">No todos yet. Add one above to get started.</p>;
  }

  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}

function TodoListItem({
  todo,
  onUpdate,
  onDelete,
  onToggle,
}: {
  todo: Todo;
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onUpdate(todo.id, {
        title: trimmedTitle,
        description: description.trim() || undefined,
        completed: todo.completed,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      await onToggle(todo.id);
    } catch (err) {
      console.error(err);
      setError("Failed to toggle completion.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this todo?")) return;
    try {
      await onDelete(todo.id);
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo.");
    }
  };

  return (
    <li className="rounded border border-slate-200 p-3 text-sm">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        />
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-y rounded border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <h2
                  className={`font-semibold ${
                    todo.completed ? "text-slate-500 line-through" : "text-slate-900"
                  }`}
                >
                  {todo.title}
                </h2>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {todo.completed ? "Completed" : "Active"}
                </span>
              </div>
              {todo.description && (
                <p className="whitespace-pre-wrap text-slate-700">{todo.description}</p>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded bg-green-600 px-3 py-1 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(todo.title);
                    setDescription(todo.description ?? "");
                    setError(null);
                  }}
                  className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded border border-red-200 px-3 py-1 font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
          {error && <p className="pt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </li>
  );
}
