# Configuration Guide

This guide provides detailed information about configuring the Bitrix24 Google Sheets Integration.

## 📋 Environment Variables

### Server Configuration
```env
# Application port
PORT=3000

# Environment mode
NODE_ENV=development
```

### Google Sheets Configuration

#### Service Account Credentials
```env
# Service account type (always service_account)
GOOGLE_CREDENTIALS_TYPE=service_account

# Google Cloud Project ID
GOOGLE_PROJECT_ID=your-project-id

# Private key ID from service account JSON
GOOGLE_PRIVATE_KEY_ID=your-private-key-id

# Private key from service account JSON (with \n for newlines)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Service account email
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Client ID from service account JSON
GOOGLE_CLIENT_ID=your-client-id

# Certificate URL
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
```

#### Google Sheets Details
```env
# Google Sheet ID (from URL)
GOOGLE_SHEET_ID=your-google-sheet-id

# Data range to read
GOOGLE_SHEET_RANGE=A:Z

# Header row number (usually 1)
GOOGLE_SHEET_HEADER_ROW=1
```

### Bitrix24 Configuration
```env
# Bitrix24 webhook URL
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your-webhook-code/

# Access token (if required)
BITRIX24_ACCESS_TOKEN=your-access-token

# Bitrix24 domain
BITRIX24_DOMAIN=your-domain.bitrix24.com
```

### Sync Configuration
```env
# Sync schedule (cron expression)
SYNC_SCHEDULE=*/15 * * * *

# Batch size for processing
SYNC_BATCH_SIZE=10

# Retry attempts for failed operations
SYNC_RETRY_ATTEMPTS=3

# Base delay between retries (milliseconds)
SYNC_RETRY_DELAY=1000

# Fields to check for duplicates
SYNC_DUPLICATE_FIELDS=email,phone
```

### Logging Configuration
```env
# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Log file path
LOG_FILE=logs/app.log
```

## 🔧 Field Mapping Configuration

### Mapping File Location
Edit `src/config/mapping.json` to customize field mappings.

### Complete Mapping Example
```json
{
  "fieldMappings": {
    "name": {
      "googleSheetColumn": "A",
      "bitrix24Field": "TITLE",
      "required": true,
      "type": "string"
    },
    "email": {
      "googleSheetColumn": "B",
      "bitrix24Field": "EMAIL",
      "required": true,
      "type": "email"
    },
    "phone": {
      "googleSheetColumn": "C",
      "bitrix24Field": "PHONE",
      "required": false,
      "type": "phone"
    },
    "company": {
      "googleSheetColumn": "D",
      "bitrix24Field": "COMPANY_TITLE",
      "required": false,
      "type": "string"
    },
    "source": {
      "googleSheetColumn": "E",
      "bitrix24Field": "SOURCE_ID",
      "required": false,
      "type": "string"
    },
    "budget": {
      "googleSheetColumn": "F",
      "bitrix24Field": "OPPORTUNITY",
      "required": false,
      "type": "number"
    },
    "status": {
      "googleSheetColumn": "G",
      "bitrix24Field": "STATUS_ID",
      "required": false,
      "type": "string"
    },
    "assignedUser": {
      "googleSheetColumn": "H",
      "bitrix24Field": "ASSIGNED_BY_ID",
      "required": false,
      "type": "string"
    },
    "notes": {
      "googleSheetColumn": "I",
      "bitrix24Field": "COMMENTS",
      "required": false,
      "type": "string"
    }
  },
  "statusColumns": {
    "syncStatus": "J",
    "leadId": "K",
    "lastSync": "L",
    "errorMessage": "M"
  },
  "statusValues": {
    "pending": "Chờ xử lý",
    "synced": "Đã đồng bộ",
    "error": "Lỗi",
    "duplicate": "Trùng lặp"
  }
}
```

### Field Mapping Properties

#### Required Properties
- `googleSheetColumn`: Column letter in Google Sheets (A, B, C, etc.)
- `bitrix24Field`: Field name in Bitrix24 (TITLE, EMAIL, etc.)
- `required`: Whether the field is required (true/false)
- `type`: Data type (string, email, phone, number)

#### Supported Types
- `string`: Text data
- `email`: Email address (validated)
- `phone`: Phone number (normalized)
- `number`: Numeric data

#### Status Columns
- `syncStatus`: Column for sync status tracking
- `leadId`: Column for Bitrix24 Lead ID
- `lastSync`: Column for last sync timestamp
- `errorMessage`: Column for error messages

## 📊 Google Sheets Setup

### Required Sheet Structure

| Column | Field | Type | Required | Description |
|--------|-------|------|----------|-------------|
| A | Name | String | Yes | Customer/Lead name |
| B | Email | Email | Yes | Customer email address |
| C | Phone | Phone | No | Customer phone number |
| D | Company | String | No | Company name |
| E | Source | String | No | Lead source (UTM, referral, etc.) |
| F | Budget | Number | No | Expected budget/opportunity value |
| G | Status | String | No | Lead status |
| H | Assigned User | String | No | Assigned user ID or name |
| I | Notes | Text | No | Additional notes |
| J | Sync Status | String | System | Sync status (hidden column) |
| K | Lead ID | String | System | Bitrix24 Lead ID (hidden column) |
| L | Last Sync | DateTime | System | Last synchronization time (hidden column) |
| M | Error Message | String | System | Error message if sync failed (hidden column) |

### Data Format Requirements

#### Name Field
- Must be non-empty string
- No special character restrictions
- Will be used as lead title in Bitrix24

#### Email Field
- Must be valid email format
- Will be validated before sync
- Used for duplicate detection

#### Phone Field
- Can be in any format
- Will be normalized (digits only)
- Used for duplicate detection

#### Company Field
- Optional company name
- Maps to COMPANY_TITLE in Bitrix24

#### Source Field
- Lead source information
- Maps to SOURCE_ID in Bitrix24
- Can be UTM parameters, referral source, etc.

#### Budget Field
- Numeric value
- Maps to OPPORTUNITY in Bitrix24
- Should be in base currency

#### Status Field
- Lead status
- Maps to STATUS_ID in Bitrix24
- Should match Bitrix24 status values

#### Assigned User Field
- User ID or name
- Maps to ASSIGNED_BY_ID in Bitrix24
- Should match Bitrix24 user IDs

#### Notes Field
- Additional information
- Maps to COMMENTS in Bitrix24
- Can contain multiple lines

## 🔗 Bitrix24 Setup

### Webhook Configuration

#### Required Permissions
- `crm.lead.add` - Create new leads
- `crm.lead.update` - Update existing leads
- `crm.lead.get` - Get lead details
- `crm.lead.list` - List leads for duplicate checking
- `crm.lead.fields` - Get lead field definitions

#### Webhook URL Format
```
https://your-domain.bitrix24.com/rest/1/your-webhook-code/
```

#### Testing Webhook
```bash
curl -X POST "https://your-domain.bitrix24.com/rest/1/your-webhook-code/crm.lead.fields"
```

### Lead Field Mapping

#### Standard Fields
- `TITLE` - Lead title (from Name)
- `EMAIL` - Email address
- `PHONE` - Phone number
- `COMPANY_TITLE` - Company name
- `SOURCE_ID` - Lead source
- `OPPORTUNITY` - Budget/opportunity value
- `STATUS_ID` - Lead status
- `ASSIGNED_BY_ID` - Assigned user
- `COMMENTS` - Notes

#### Custom Fields
You can map to custom fields by using their field codes:
```json
{
  "customField": {
    "googleSheetColumn": "N",
    "bitrix24Field": "UF_CRM_CUSTOM_FIELD",
    "required": false,
    "type": "string"
  }
}
```

## ⚙️ Advanced Configuration

### Sync Schedule Configuration

#### Cron Expression Format
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 or 7 is Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

#### Common Schedules
```env
# Every 15 minutes
SYNC_SCHEDULE=*/15 * * * *

# Every hour
SYNC_SCHEDULE=0 * * * *

# Every 2 hours
SYNC_SCHEDULE=0 */2 * * *

# Daily at 9 AM
SYNC_SCHEDULE=0 9 * * *

# Weekdays at 9 AM
SYNC_SCHEDULE=0 9 * * 1-5
```

### Batch Processing Configuration

#### Batch Size
```env
# Small batches (more API calls, less memory)
SYNC_BATCH_SIZE=5

# Large batches (fewer API calls, more memory)
SYNC_BATCH_SIZE=20

# Default (balanced)
SYNC_BATCH_SIZE=10
```

#### Retry Configuration
```env
# Number of retry attempts
SYNC_RETRY_ATTEMPTS=3

# Base delay between retries (milliseconds)
SYNC_RETRY_DELAY=1000

# Exponential backoff: delay * 2^(attempt-1)
# Attempt 1: 1000ms
# Attempt 2: 2000ms
# Attempt 3: 4000ms
```

### Duplicate Detection Configuration

#### Duplicate Check Fields
```env
# Check email only
SYNC_DUPLICATE_FIELDS=email

# Check phone only
SYNC_DUPLICATE_FIELDS=phone

# Check both email and phone
SYNC_DUPLICATE_FIELDS=email,phone
```

#### Duplicate Detection Logic
1. For each lead, check specified fields
2. Search Bitrix24 for existing leads with matching values
3. If duplicates found, update existing lead
4. If no duplicates, create new lead

### Logging Configuration

#### Log Levels
```env
# Error level (errors only)
LOG_LEVEL=error

# Warning level (warnings and errors)
LOG_LEVEL=warn

# Info level (info, warnings, errors)
LOG_LEVEL=info

# Debug level (all messages)
LOG_LEVEL=debug
```

#### Log File Configuration
```env
# Log file path
LOG_FILE=logs/app.log

# Log rotation (handled by system)
# Consider using logrotate for production
```

## 🔒 Security Configuration

### Environment Variables Security
- Never commit `.env` files to version control
- Use different configurations for different environments
- Store sensitive data in secure environment variable systems

### API Security
- Use service accounts for Google Sheets (not user credentials)
- Implement webhook authentication for Bitrix24
- Validate all input data
- Implement rate limiting

### Network Security
- Use HTTPS for all API communications
- Implement proper firewall rules
- Monitor network traffic
- Use VPN for sensitive environments

## 📈 Performance Optimization

### Memory Optimization
```env
# Reduce batch size for low memory systems
SYNC_BATCH_SIZE=5

# Increase retry delay to reduce API calls
SYNC_RETRY_DELAY=2000
```

### API Rate Limiting
```env
# Respect Google Sheets API limits (100 requests/100 seconds)
# Respect Bitrix24 API limits (2 requests/second)
# Use batch processing to reduce API calls
```

### Monitoring Configuration
```env
# Enable detailed logging for monitoring
LOG_LEVEL=info

# Monitor sync performance
# Check logs/app.log for performance metrics
```

## 🧪 Testing Configuration

### Test Environment
```env
# Use test Google Sheet
GOOGLE_SHEET_ID=test-sheet-id

# Use test Bitrix24 webhook
BITRIX24_WEBHOOK_URL=https://test-domain.bitrix24.com/rest/1/test-webhook/

# Enable debug logging
LOG_LEVEL=debug
```

### Validation Commands
```bash
# Test all connections
npm run validate

# Test individual components
curl http://localhost:3000/google-sheets/validate
curl http://localhost:3000/bitrix24/validate

# Manual sync test
npm run sync
```

## 📝 Configuration Examples

### Development Environment
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
SYNC_SCHEDULE=*/5 * * * *
SYNC_BATCH_SIZE=5
```

### Production Environment
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
SYNC_SCHEDULE=*/15 * * * *
SYNC_BATCH_SIZE=10
```

### High-Volume Environment
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
SYNC_SCHEDULE=*/30 * * * *
SYNC_BATCH_SIZE=20
SYNC_RETRY_ATTEMPTS=5
SYNC_RETRY_DELAY=2000
```

## 🔄 Configuration Updates

### Hot Reloading
Configuration changes require application restart:
```bash
# Restart application
npm run start:dev

# Or with Docker
docker-compose restart
```

### Configuration Validation
```bash
# Validate configuration
npm run validate

# Check specific components
curl http://localhost:3000/health
```

### Backup Configuration
```bash
# Backup current configuration
cp .env .env.backup
cp src/config/mapping.json src/config/mapping.json.backup
```
