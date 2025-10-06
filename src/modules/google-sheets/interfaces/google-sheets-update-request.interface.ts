export interface GoogleSheetsUpdateRequest {
  range: string;
  values: string[][];
  sheetName?: string;
}
