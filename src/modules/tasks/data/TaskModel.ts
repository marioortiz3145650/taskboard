import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Task extends Model {
  static table = 'tasks';

  @field('remote_id') remoteId!: number;
  @text('title') title!: string;
  @field('completed') completed!: boolean;
  @field('user_id') userId!: number;
  @field('is_dirty') isDirty!: boolean;
  @readonly @date('synced_at') syncedAt!: Date;
}
