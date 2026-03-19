"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTodos,
  createTodo as apiCreateTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
  toggleTodo as apiToggleTodo,
  type CreateTodoInput,
  type UpdateTodoInput,
  type Todo,
} from "../lib/api";

const TODOS_QUERY_KEY = ["todos"] as const;

export function useTodos() {
  const queryClient = useQueryClient();

  const todosQuery = useQuery<Todo[], Error>({
    queryKey: TODOS_QUERY_KEY,
    queryFn: fetchTodos,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTodoInput) => apiCreateTodo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTodoInput }) =>
      apiUpdateTodo(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDeleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => apiToggleTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });

  return {
    todos: todosQuery.data,
    isLoading: todosQuery.isLoading,
    isError: todosQuery.isError,
    error: todosQuery.error,
    createTodo: async (input: CreateTodoInput) => {
      await createMutation.mutateAsync(input);
    },
    updateTodo: async (id: number, input: UpdateTodoInput) => {
      await updateMutation.mutateAsync({ id, input });
    },
    deleteTodo: async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    toggleTodo: async (id: number) => {
      await toggleMutation.mutateAsync(id);
    },
  };
}
