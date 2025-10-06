# API Reference

## Health Check

### GET /health
Returns the health status of the application.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T05:49:54.579Z",
  "service": "Bitrix24 Google Sheets Integration"
}
```

## Google Sheets

### GET /google-sheets/validate
Validates the Google Sheets connection.

**Response:**
```json
{
  "valid": true
}
```

### GET /google-sheets/data
Retrieves data from Google Sheets.

**Response:**
```json
{
  "value": [
    {
      "rowNumber": 2,
      "data": {
        "Name": "John Doe",
        "Email": "john@example.com"
      },
      "syncStatus": "pending",
      "leadId": "",
      "lastSync": "",
      "errorMessage": ""
    }
  ],
  "Count": 1
}
```

## Bitrix24

### GET /bitrix24/validate
Validates the Bitrix24 connection.

**Response:**
```json
{
  "valid": true
}
```

## Sync Operations

### GET /sync/stats
Gets current sync statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "created": 5,
    "updated": 2,
    "skipped": 3,
    "errors": 0,
    "duplicates": 0
  }
}
```

### POST /sync/start
Triggers manual sync operation.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "created": 5,
    "updated": 2,
    "skipped": 3,
    "errors": 0,
    "duplicates": 0
  },
  "duration": 2500,
  "timestamp": "2025-10-02T06:00:00.000Z"
}
```

### POST /sync/reset
Resets sync status for all records.

**Response:**
```json
{
  "success": true,
  "message": "Sync status reset successfully"
}
```
