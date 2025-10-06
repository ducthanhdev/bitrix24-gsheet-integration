export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  google: {
    credentials: {
      type: process.env.GOOGLE_CREDENTIALS_TYPE || 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID || '',
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || '',
    },
    sheets: {
      spreadsheetId: process.env.GOOGLE_SHEET_ID || '',
      range: process.env.GOOGLE_SHEET_RANGE || 'A:Z',
      headerRow: parseInt(process.env.GOOGLE_SHEET_HEADER_ROW || '6', 10),
    },
  },
  bitrix24: {
    webhookUrl: process.env.BITRIX24_WEBHOOK_URL || '',
    accessToken: process.env.BITRIX24_ACCESS_TOKEN || '',
    domain: process.env.BITRIX24_DOMAIN || '',
  },
  sync: {
    schedule: process.env.SYNC_SCHEDULE || '*/15 * * * *', // Every 15 minutes
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '10', 10),
    retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.SYNC_RETRY_DELAY || '1000', 10),
    duplicateCheckFields: (process.env.SYNC_DUPLICATE_FIELDS || 'email,phone').split(','),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
});
