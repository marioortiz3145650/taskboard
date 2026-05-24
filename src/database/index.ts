import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import Task from '../modules/tasks/data/TaskModel';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('Failed to initialize WatermelonDB adapter:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Task],
});
