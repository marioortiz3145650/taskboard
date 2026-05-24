export interface RemoteTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface RemoteTodosResponse {
  todos: RemoteTodo[];
  total: number;
  skip: number;
  limit: number;
}

export async function fetchRemoteTodos(): Promise<RemoteTodo[]> {
  const response = await fetch('https://dummyjson.com/todos');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: RemoteTodosResponse = await response.json();
  return data.todos;
}
