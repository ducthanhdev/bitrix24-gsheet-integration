# API Reference

This document provides detailed information about all available API endpoints in the Bitrix24 Google Sheets Integration.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require proper configuration in environment variables. No additional authentication headers are needed.

## Endpoints

### Health Check

#### GET /health
Check application health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "Bitrix24 Google Sheets Integration"
}
```

**Status Codes:**
- `200 OK`: Application is healthy

---

### Google Sheets Operations

#### GET /google-sheets/validate
Test Google Sheets connection.

**Response:**
```json
{
  "valid": true,
  "message": "Google Sheets connection successful"
}
```

**Status Codes:**
- `200 OK`: Connection successful
- `500 Internal Server Error`: Connection failed

#### GET /google-sheets/data
Read data from Google Sheets.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rowNumber": 2,
      "data": {
        "Name": "John Doe",
        "Email": "john@example.com",
        "Phone": "1234567890"
      },
      "syncStatus": "pending",
      "leadId": "",
      "lastSync": "",
      "errorMessage": ""
    }
  ],
  "total": 1
}
```

#### POST /google-sheets/test-read
Test reading data from Google Sheets.

**Request Body:**
```json
{
  "range": "A1:Z100"
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Data read successfully"
}
```

---

### Bitrix24 Operations

#### GET /bitrix24/validate
Test Bitrix24 connection.

**Response:**
```json
{
  "valid": true,
  "message": "Bitrix24 connection successful"
}
```

#### POST /bitrix24/test-lead
Test creating a lead in Bitrix24.

**Request Body:**
```json
{
  "TITLE": "Test Lead",
  "EMAIL": [
    {
      "VALUE": "test@example.com",
      "VALUE_TYPE": "WORK"
    }
  ],
  "PHONE": [
    {
      "VALUE": "1234567890",
      "VALUE_TYPE": "WORK"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "lead": {
    "ID": "123",
    "TITLE": "Test Lead",
    "EMAIL": "test@example.com",
    "PHONE": "1234567890"
  }
}
```

---

### Sync Operations

#### POST /sync/start
Start manual synchronization.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "created": 5,
    "updated": 3,
    "skipped": 2,
    "errors": 0,
    "duplicates": 0
  },
  "duration": 1500,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### GET /sync/stats
Get current synchronization statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 100,
    "created": 45,
    "updated": 30,
    "skipped": 20,
    "errors": 5,
    "duplicates": 0
  }
}
```

#### POST /sync/reset
Reset sync status for all rows.

**Response:**
```json
{
  "success": true,
  "message": "Sync status reset successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

The application implements rate limiting to respect API quotas:

- **Google Sheets API**: 100 requests per 100 seconds per user
- **Bitrix24 API**: 2 requests per second per webhook
- **Retry Mechanism**: 3 attempts with exponential backoff
- **Batch Processing**: Configurable batch size (default: 10)

## Request/Response Examples

### cURL Examples

#### Health Check
```bash
curl -X GET http://localhost:3000/health
```

#### Manual Sync
```bash
curl -X POST http://localhost:3000/sync/start
```

#### Get Sync Stats
```bash
curl -X GET http://localhost:3000/sync/stats
```

#### Test Bitrix24 Connection
```bash
curl -X GET http://localhost:3000/bitrix24/validate
```

#### Test Google Sheets Connection
```bash
curl -X GET http://localhost:3000/google-sheets/validate
```

### JavaScript Examples

#### Using Fetch API
```javascript
// Health check
const health = await fetch('http://localhost:3000/health')
  .then(res => res.json());

// Manual sync
const syncResult = await fetch('http://localhost:3000/sync/start', {
  method: 'POST'
}).then(res => res.json());

// Get statistics
const stats = await fetch('http://localhost:3000/sync/stats')
  .then(res => res.json());
```

#### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Health check
const health = await api.get('/health');

// Manual sync
const syncResult = await api.post('/sync/start');

// Get statistics
const stats = await api.get('/sync/stats');
```

## Monitoring and Logging

### Log Levels
- `error`: Critical errors that prevent operation
- `warn`: Warning messages for potential issues
- `info`: General information about operations
- `debug`: Detailed debugging information

### Log Files
- **Console**: Real-time logs in console
- **File**: Detailed logs in `logs/app.log`
- **Format**: JSON format for easy parsing

### Health Monitoring
- **Application Health**: `/health` endpoint
- **Connection Status**: Individual service validation endpoints
- **Performance Metrics**: Sync statistics and timing
- **Error Tracking**: Comprehensive error logging

## Configuration

### Environment Variables
All API behavior is controlled through environment variables. See the main README.md for complete configuration options.

### Field Mapping
API responses and data processing are controlled by the `src/config/mapping.json` file. This allows customization of field mappings between Google Sheets and Bitrix24.

### Rate Limiting
Rate limiting behavior can be configured through environment variables:
- `SYNC_BATCH_SIZE`: Number of records per batch
- `SYNC_RETRY_ATTEMPTS`: Number of retry attempts
- `SYNC_RETRY_DELAY`: Base delay between retries

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check environment variables and network connectivity
2. **Permission Errors**: Verify API credentials and permissions
3. **Rate Limiting**: Adjust batch size and retry settings
4. **Data Validation**: Check field mappings and data format

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

### Log Analysis
```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Monitor sync activity
grep "Sync completed" logs/app.log
```
