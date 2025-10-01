export interface Bitrix24Lead {
  ID: string;
  TITLE: string;
  EMAIL?: string;
  PHONE?: string;
  COMPANY_TITLE?: string;
  SOURCE_ID?: string;
  OPPORTUNITY?: number;
  STATUS_ID?: string;
  ASSIGNED_BY_ID?: string;
  COMMENTS?: string;
  DATE_CREATE?: string;
  DATE_MODIFY?: string;
}
