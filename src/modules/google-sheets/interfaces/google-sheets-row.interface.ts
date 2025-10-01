export interface GoogleSheetsRow {
  rowNumber: number;
  data: Record<string, string>;
  syncStatus: string;
  leadId: string;
  lastSync: string;
  errorMessage: string;
}
