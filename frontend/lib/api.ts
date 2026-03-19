export interface Todo {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title: string;
  description?: string;
  completed: boolean;
}

const API_BASE_URL = "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // ignore JSON parse errors and fall back to default message
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE_URL}/todos`);
  return handleResponse<Todo[]>(res);
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    await handleResponse(res);
  }
}

export async function toggleTodo(id: number): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}/toggle`, {
    method: "POST",
  });
  return handleResponse<Todo>(res);
}
