import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'remote_id', type: 'number', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'user_id', type: 'number' },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'synced_at', type: 'number' },
      ],
    }),
  ],
});
