export interface SyncResult {
  success: boolean;
  stats?: SyncStats;
  error?: string;
  duration: number;
  timestamp: string;
}
