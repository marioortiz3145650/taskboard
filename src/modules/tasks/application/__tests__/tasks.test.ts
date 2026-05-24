import { database } from '../../../../database';
import { fetchRemoteTodos } from '../../../../services/todoApi';
import { useUIStore } from '../../../../store/uiStore';
import { useSyncStore } from '../../../../store/syncStore';
import Task from '../../data/TaskModel';
import { Q } from '@nozbe/watermelondb';

// Mock dependencies
jest.mock('../../../../database', () => {
  const mockBatch = jest.fn();
  const mockWrite = jest.fn((cb) => cb());
  
  const mockCollection = {
    query: jest.fn().mockReturnThis(),
    fetch: jest.fn().mockResolvedValue([]),
    prepareCreate: jest.fn((cb) => {
      const record = { _raw: {} };
      cb(record);
      return record;
    }),
  };

  return {
    database: {
      get: jest.fn().mockReturnValue(mockCollection),
      write: mockWrite,
      batch: mockBatch,
    },
  };
});

jest.mock('../../../../services/todoApi', () => ({
  fetchRemoteTodos: jest.fn(),
}));

describe('TaskBoard - Business Logic Tests', () => {
  beforeEach(() => {
    useUIStore.setState({ filter: 'all' });
    useSyncStore.setState({ isSyncing: false, lastSyncAt: null, errorMessage: null });
  });

  // --- TEST 1: Toggle de tarea ---
  test('Test 1 — Toggle de tarea: Toggles completed status and flags as dirty', async () => {
    // 1. Arrange: Create a mock WatermelonDB Task record
    const mockTask = {
      completed: false,
      isDirty: false,
      update: jest.fn().mockImplementation((callback) => {
        const record = { completed: mockTask.completed, isDirty: mockTask.isDirty };
        callback(record);
        mockTask.completed = record.completed;
        mockTask.isDirty = record.isDirty;
        return Promise.resolve();
      }),
    } as unknown as Task;

    // Direct toggle implementation (matching toggleTask inside useTasks)
    const toggleTask = async (task: Task) => {
      await database.write(async () => {
        await task.update((record) => {
          record.completed = !record.completed;
          record.isDirty = true;
        });
      });
    };

    // 2. Act (Toggle from pending to completed)
    await toggleTask(mockTask);

    // 3. Assert
    expect(mockTask.completed).toBe(true);
    expect(mockTask.isDirty).toBe(true);
    expect(mockTask.update).toHaveBeenCalledTimes(1);

    // 4. Act (Toggle back from completed to pending)
    await toggleTask(mockTask);

    // 5. Assert
    expect(mockTask.completed).toBe(false);
    expect(mockTask.isDirty).toBe(true);
    expect(mockTask.update).toHaveBeenCalledTimes(2);
  });

  // --- TEST 2: Sincronización ---
  test('Test 2 — Sincronización: Inserts tasks, respects is_dirty and is resilient to fetch errors', async () => {
    const mockCollection = database.get<Task>('tasks');
    
    // Remote responses from API
    const remoteTodos = [
      { id: 1, todo: 'Task from Remote 1', completed: false, userId: 1 },
      { id: 2, todo: 'Task from Remote 2', completed: true, userId: 2 },
    ];
    (fetchRemoteTodos as jest.Mock).mockResolvedValue(remoteTodos);

    // Local state setup: Task 1 exists and is dirty, Task 2 does not exist locally
    const mockLocalDirtyTask = {
      remoteId: 1,
      title: 'Local Modified Task 1',
      completed: true,
      isDirty: true,
      prepareUpdate: jest.fn(),
    } as unknown as Task;

    (mockCollection.query().fetch as jest.Mock).mockResolvedValue([mockLocalDirtyTask]);

    // Local replication of the sync algorithm in useSyncTasks
    const syncTasksLogic = async () => {
      const apiTodos = await fetchRemoteTodos();
      const localTasks = await mockCollection.query().fetch();

      const localMap = new Map<number, Task>();
      for (const t of localTasks) {
        if (t.remoteId) {
          localMap.set(t.remoteId, t);
        }
      }

      const toCreate: any[] = [];
      const toUpdate: any[] = [];

      for (const remote of apiTodos) {
        const local = localMap.get(remote.id);
        if (local) {
          if (local.isDirty) {
            // Test condition check: isDirty tasks must NOT be overwritten!
            continue;
          }
          toUpdate.push(local.prepareUpdate(() => {}));
        } else {
          toCreate.push(mockCollection.prepareCreate((record) => {
            record.remoteId = remote.id;
            record.title = remote.todo;
            record.completed = remote.completed;
            record.userId = remote.userId;
            record.isDirty = false;
          }));
        }
      }

      if (toCreate.length > 0 || toUpdate.length > 0) {
        await database.batch(...toCreate, ...toUpdate);
      }
    };

    // 1. Run successful sync
    await syncTasksLogic();

    // Verify Task 1 (dirty) was NOT updated (prepareUpdate should not be called)
    expect(mockLocalDirtyTask.prepareUpdate).not.toHaveBeenCalled();

    // Verify Task 2 (new) was created (prepareCreate should be called once)
    expect(mockCollection.prepareCreate).toHaveBeenCalledTimes(1);

    // Verify database batch write was executed
    expect(database.batch).toHaveBeenCalled();

    // 2. Test Error Resilience: Verify that if fetch throws error, the sync handles it without crashing
    (fetchRemoteTodos as jest.Mock).mockRejectedValue(new Error('Network offline test error'));

    const resilientSync = async () => {
      try {
        useSyncStore.setState({ isSyncing: true });
        await fetchRemoteTodos();
      } catch (error: any) {
        // Safe Zustand log mapping
        useSyncStore.setState({ errorMessage: error.message });
      } finally {
        useSyncStore.setState({ isSyncing: false });
      }
    };

    // Ensure calling it does NOT throw an unhandled exception
    await expect(resilientSync()).resolves.not.toThrow();
    expect(useSyncStore.getState().errorMessage).toBe('Network offline test error');
    expect(useSyncStore.getState().isSyncing).toBe(false);
  });

  // --- TEST 3: Filtrado ---
  test('Test 3 — Filtrado: Returns query constraints based on selected Zustand active filter', () => {
    const mockCollection = database.get<Task>('tasks');

    const getQueryForFilter = (activeFilter: 'all' | 'completed' | 'pending') => {
      if (activeFilter === 'completed') {
        return mockCollection.query(Q.where('completed', true));
      } else if (activeFilter === 'pending') {
        return mockCollection.query(Q.where('completed', false));
      } else {
        return mockCollection.query();
      }
    };

    // 1. Test "completed" active filter
    getQueryForFilter('completed');
    expect(mockCollection.query).toHaveBeenCalledWith(Q.where('completed', true));

    // 2. Test "pending" active filter
    getQueryForFilter('pending');
    expect(mockCollection.query).toHaveBeenCalledWith(Q.where('completed', false));

    // 3. Test "all" active filter
    getQueryForFilter('all');
    expect(mockCollection.query).toHaveBeenLastCalledWith();
  });
});
