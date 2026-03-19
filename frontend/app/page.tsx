"use client";

import { useState } from "react";
import { useTodos } from "../hooks/useTodos";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";

export type Filter = "all" | "active" | "completed";

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { todos, isLoading, isError, error, createTodo, updateTodo, deleteTodo, toggleTodo } =
    useTodos();

  const filteredTodos = todos?.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <p className="text-sm text-slate-600">
          Shared todo list powered by a FastAPI backend at http://localhost:8000.
        </p>
      </header>

      <section className="rounded-md bg-white p-4 shadow">
        <TodoForm onSubmit={createTodo} />
      </section>

      <section className="flex items-center justify-between gap-4">
        <div className="flex gap-2 text-sm">
          <FilterButton label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterButton
            label="Active"
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />
          <FilterButton
            label="Completed"
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
          />
        </div>
      </section>

      <section className="rounded-md bg-white p-4 shadow">
        {isLoading && <p>Loading todos...</p>}
        {isError && <p className="text-red-600">Error: {error?.message ?? "Failed to load"}</p>}
        {!isLoading && !isError && (
          <TodoList
            todos={filteredTodos ?? []}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            onToggle={toggleTodo}
          />
        )}
      </section>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}
