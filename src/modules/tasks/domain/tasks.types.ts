/**
 * TaskBoard - Domain Types for Tasks Module
 * 
 * This file contains all TypeScript interfaces and types for the tasks domain,
 * ensuring strict type safety across the application.
 */

/**
 * Represents a task entity in the application
 */
export interface TaskData {
  id?: string;
  remoteId: number;
  title: string;
  completed: boolean;
  userId: number;
  isDirty: boolean;
  syncedAt: Date;
}

/**
 * API response structure from dummyjson.com/todos
 */
export interface RemoteTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

/**
 * Complete response from the todos API
 */
export interface RemoteTodosResponse {
  todos: RemoteTodo[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Filter options for task queries
 */
export type TaskFilter = 'all' | 'completed' | 'pending';

/**
 * Repository interface for task data operations
 */
export interface TaskRepository {
  getAll(): Promise<TaskData[]>;
  getById(id: string): Promise<TaskData | null>;
  create(task: Omit<TaskData, 'id'>): Promise<TaskData>;
  update(task: TaskData): Promise<TaskData>;
  delete(id: string): Promise<void>;
  toggleComplete(id: string): Promise<TaskData>;
}

/**
 * Sync status information
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: number | null;
  errorMessage: string | null;
}