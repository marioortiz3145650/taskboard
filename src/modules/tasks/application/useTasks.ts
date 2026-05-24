import { Q } from '@nozbe/watermelondb';
import { useEffect, useMemo, useState } from 'react';
import { database } from '../../../database';
import { useUIStore } from '../../../store/uiStore';
import Task from '../data/TaskModel';

export function useTasks() {
  const filter = useUIStore((state) => state.filter);
  const tasksCollection = useMemo(() => database.get<Task>('tasks'), []);

  const query = useMemo(() => {
    if (filter === 'completed') {
      return tasksCollection.query(Q.where('completed', true));
    } else if (filter === 'pending') {
      return tasksCollection.query(Q.where('completed', false));
    } else {
      return tasksCollection.query();
    }
  }, [filter, tasksCollection]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    const subscription = query.observe().subscribe({
      next: (newTasks) => setTasks(newTasks),
      error: (error) => console.error('Error observing tasks:', error),
    });
    return () => subscription.unsubscribe();
  }, [query]);

  useEffect(() => {
    const subscription = tasksCollection.query().observe().subscribe({
      next: (t) => setAllTasks(t),
      error: (error) => console.error('Error observing all tasks:', error),
    });
    return () => subscription.unsubscribe();
  }, [tasksCollection]);

  const toggleTask = async (task: Task) => {
    try {
      await database.write(async () => {
        await task.update((record) => {
          record.completed = !record.completed;
        });
      });
      // Fuerza re-fetch
      const updated = await tasksCollection.query().fetch();
      setAllTasks(updated);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const completedCount = allTasks.filter(t => t.completed).length;
  const totalCount = allTasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return {
    tasks,
    toggleTask,
    filter,
    completedCount,
    totalCount,
    progress,
  };
}