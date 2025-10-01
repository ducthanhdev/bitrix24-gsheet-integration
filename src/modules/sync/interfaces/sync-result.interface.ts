import type { SyncStats } from './sync-stats.interface';

export interface SyncResult {
  success: boolean;
  stats?: SyncStats;
  error?: string;
  duration: number;
  timestamp: string;
}
