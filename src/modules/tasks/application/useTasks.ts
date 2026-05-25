import { Q } from '@nozbe/watermelondb';
import { useEffect, useMemo, useState } from 'react';
import { database } from '../../../database'; 
import { useUIStore } from '../../../store/uiStore';
import Task from '../data/TaskModel';

export function useTasks() {
  const filter = useUIStore((state) => state.filter);
  const tasksCollection = useMemo(() => database.get<Task>('tasks'), []);
  const [search, setSearch] = useState<string>('');

  const query = useMemo(() => {
    const conditions: any[] = [];
    if (filter === 'completed') {
      conditions.push(Q.where('completed', true));
    } else if (filter === 'pending') {
      conditions.push(Q.where('completed', false));
    }
    if (search.trim()) {
      conditions.push(Q.where('title', Q.like(`%${Q.sanitizeLikeString(search)}%`)));
    }
    return tasksCollection.query(...conditions);
  }, [filter, search, tasksCollection]);

  // Usamos dos estados separados para evitar conflictos de renderizado
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // OBSERVADOR PRINCIPAL: Este es el que debe disparar la UI
  useEffect(() => {
    // Cancelamos suscripción anterior si cambia la query
    let isSubscribed = true;
    
    const subscription = query.observe().subscribe({
      next: (newTasks) => {
        if (isSubscribed) {
          // Forzamos una nueva referencia de array para asegurar que React detecte el cambio
          setTasks([...newTasks]);
        }
      },
      error: (error) => console.error('Error observing tasks:', error),
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [query]); // Dependencia crítica: query

  // OBSERVADOR SECUNDARIO: Para la barra de progreso y conteos globales
  useEffect(() => {
    let isSubscribed = true;
    const subscription = tasksCollection.query().observe().subscribe({
      next: (t) => {
        if (isSubscribed) setAllTasks([...t]);
      },
      error: (error) => console.error('Error observing all tasks:', error),
    });
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [tasksCollection]);

  // ACCIONES: Todas escriben en la BD. WatermelonDB dispara los observadores automáticamente.
  const toggleTask = async (task: Task) => {
  await database.write(async () => {
    await task.update((record) => {
      record.completed = !record.completed;
      (record as any)._raw.is_dirty = true;
    });
  });
  const updated = await tasksCollection.query().fetch();
  setAllTasks([...updated]);
};

const createTask = async (title: string) => {
  await database.write(async () => {
    await tasksCollection.create((record) => {
      record.title = title;
      record.completed = false;
      (record as any)._raw.is_dirty = true;
      (record as any)._raw.remote_id = 0;
      (record as any)._raw.user_id = 0;
      (record as any)._raw.synced_at = Date.now();
    });
  });
  const updated = await tasksCollection.query().fetch();
  setAllTasks([...updated]);
};

const deleteTask = async (task: Task) => {
  await database.write(async () => {
    await task.destroyPermanently();
  });
  const updated = await tasksCollection.query().fetch();
  setAllTasks([...updated]);
};

  const updateTask = async (task: Task, title: string, newUri?: string) => {
    await database.write(async () => {
      await task.update((record) => {
        record.title = title;
        if (newUri !== undefined) {
          (record as any).attachmentUri = newUri;
        }
        (record as any)._raw.is_dirty = true;
      });
    });
    // Fuerza re-fetch manual
    const updated = await tasksCollection.query().fetch();
    setTasks([...updated]);
  };


  const completedCount = allTasks.filter(t => t.completed).length;
  const totalCount = allTasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return {
    tasks,
    toggleTask,
    createTask,
    updateTask,
    deleteTask,
    filter,
    completedCount,
    totalCount,
    progress,
    search,
    setSearch,
  };
}