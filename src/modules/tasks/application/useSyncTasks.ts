import { useCallback } from 'react';
import { database } from '../../../database';
import Task from '../data/TaskModel';
import { fetchRemoteTodos } from '../../../services/todoApi';
import { useSyncStore } from '../../../store/syncStore';

export function useSyncTasks() {
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const lastSyncAt = useSyncStore((state) => state.lastSyncAt);
  const errorMessage = useSyncStore((state) => state.errorMessage);
  const setSyncing = useSyncStore((state) => state.setSyncing);
  const setLastSyncAt = useSyncStore((state) => state.setLastSyncAt);
  const setErrorMessage = useSyncStore((state) => state.setErrorMessage);

  const syncTasks = useCallback(async () => {
    if (isSyncing) return;

    setSyncing(true);
    setErrorMessage(null);

    try {
      // 1. Fetch remote todos
      const remoteTodos = await fetchRemoteTodos();

      // 2. Fetch all local tasks to build a map for fast lookup O(N)
      const tasksCollection = database.get<Task>('tasks');
      const allLocalTasks = await tasksCollection.query().fetch();
      
      const localTaskMap = new Map<number, Task>();
      for (const localTask of allLocalTasks) {
        if (localTask.remoteId) {
          localTaskMap.set(localTask.remoteId, localTask);
        }
      }

      const tasksToCreate: Task[] = [];
      const tasksToUpdate: Task[] = [];

      // 3. Process remote todos and decide whether to update or create
      for (const remote of remoteTodos) {
        const local = localTaskMap.get(remote.id);

        if (local) {
          // Rule: If local task is modified offline (is_dirty === true), keep local changes.
          if (local.isDirty) {
            continue;
          }

          // Check if fields differ, then prepare update
          if (
            local.title !== remote.todo ||
            local.completed !== remote.completed ||
            local.userId !== remote.userId
          ) {
            tasksToUpdate.push(
              local.prepareUpdate((record) => {
                record.title = remote.todo;
                record.completed = remote.completed;
                record.userId = remote.userId;
                // WatermelonDB prepares dates as Dates, which under the hood serializes to timestamps
                (record as any)._raw.synced_at = Date.now();
              })
            );
          }
        } else {
          // Prepare new record creation
          tasksToCreate.push(
            tasksCollection.prepareCreate((record) => {
              record.remoteId = remote.id;
              record.title = remote.todo;
              record.completed = remote.completed;
              record.userId = remote.userId;
              record.isDirty = false;
              (record as any)._raw.synced_at = Date.now();
            })
          );
        }
      }

      // 4. Perform database batch write
      if (tasksToCreate.length > 0 || tasksToUpdate.length > 0) {
        await database.write(async () => {
          await database.batch(...tasksToCreate, ...tasksToUpdate);
        });
      }

      setLastSyncAt(Date.now());
    } catch (error: any) {
      console.warn('Sync failed, using offline data:', error);
      setErrorMessage(error?.message || 'Sync failed due to network issues');
    } finally {
      setSyncing(false);
    }
  }, [isSyncing, setSyncing, setLastSyncAt, setErrorMessage]);

  return {
    syncTasks,
    isSyncing,
    lastSyncAt,
    errorMessage,
  };
}
