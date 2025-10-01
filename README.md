# Bitrix24 Google Sheets Integration

A comprehensive NestJS application that automatically synchronizes data between Google Sheets and Bitrix24 CRM, eliminating manual data entry and ensuring data consistency.

## 🚀 Features

### Core Functionality
- **One-way Sync**: Automatically sync leads from Google Sheets to Bitrix24
- **Duplicate Detection**: Prevents duplicate leads based on email and phone
- **Flexible Mapping**: Configurable field mapping between Google Sheets and Bitrix24
- **Status Tracking**: Real-time sync status tracking in Google Sheets
- **Error Handling**: Comprehensive error handling with detailed logging
- **Scheduled Sync**: Automatic synchronization every 15 minutes (configurable)

### Advanced Features
- **Batch Processing**: Efficient batch operations for better performance
- **Rate Limiting**: Respects API rate limits with retry mechanisms
- **CLI Commands**: Command-line interface for manual operations
- **REST API**: HTTP endpoints for integration and monitoring
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- Google Cloud Platform account with Sheets API enabled
- Bitrix24 account with REST API access
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bitrix24-gsheet-integration
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Bitrix24 Configuration  
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your-webhook-code/
BITRIX24_ACCESS_TOKEN=your-access-token
```

## 🔧 Setup Instructions

### Google Sheets Setup

1. **Create a Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create a service account and download the JSON key file
   - Extract the credentials and add them to your `.env` file

2. **Prepare Your Google Sheet**:
   - Create a Google Sheet with the following columns:
     - Column A: Name (required)
     - Column B: Email (required)
     - Column C: Phone
     - Column D: Company
     - Column E: Source
     - Column F: Budget
     - Column G: Status
     - Column H: Assigned User
     - Column I: Notes
     - Column J: Sync Status (hidden)
     - Column K: Lead ID (hidden)
     - Column L: Last Sync (hidden)
     - Column M: Error Message (hidden)

3. **Share the Sheet**:
   - Share your Google Sheet with the service account email
   - Give "Editor" permissions

### Bitrix24 Setup

1. **Create a Webhook**:
   - Go to your Bitrix24 admin panel
   - Navigate to Applications → Webhooks
   - Create a new webhook with the following permissions:
     - `crm.lead.add`
     - `crm.lead.update`
     - `crm.lead.get`
     - `crm.lead.list`
     - `crm.lead.fields`

2. **Get Webhook URL**:
   - Copy the webhook URL and add it to your `.env` file
   - The URL should look like: `https://your-domain.bitrix24.com/rest/1/your-webhook-code/`

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Using Docker
```bash
docker-compose up -d
```

## 📊 CLI Commands

### Validate Connections
```bash
npm run validate
```
Checks if Google Sheets and Bitrix24 connections are working properly.

### Manual Sync
```bash
npm run sync
```
Manually triggers synchronization between Google Sheets and Bitrix24.

### View Statistics
```bash
npm run stats
```
Shows current synchronization statistics.

## 🌐 API Endpoints

### Health Check
```
GET /health
```
Returns application health status.

### Google Sheets
```
GET /google-sheets/validate
GET /google-sheets/data
POST /google-sheets/test-read
```

### Bitrix24
```
GET /bitrix24/validate
GET /bitrix24/fields
POST /bitrix24/test-lead
```

### Sync Operations
```
POST /sync/start
GET /sync/stats
POST /sync/reset
```

## 📈 Monitoring and Logging

The application provides comprehensive logging:
- **Console Logs**: Real-time status updates
- **File Logs**: Detailed logs saved to `logs/app.log`
- **Sync Statistics**: Track created, updated, skipped, and error records
- **Error Tracking**: Detailed error messages for troubleshooting

## 🔧 Configuration

### Field Mapping
Edit `src/config/mapping.json` to customize field mappings:

```json
{
  "fieldMappings": {
    "name": {
      "googleSheetColumn": "A",
      "bitrix24Field": "TITLE",
      "required": true,
      "type": "string"
    }
  }
}
```

### Sync Schedule
Modify the sync schedule in your `.env` file:
```env
SYNC_SCHEDULE=*/15 * * * *  # Every 15 minutes
```

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t bitrix24-gsheet-integration .
```

### Run Container
```bash
docker run -d \
  --name bitrix24-sync \
  --env-file .env \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  bitrix24-gsheet-integration
```

### Using Docker Compose
```bash
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Google Sheets Permission Error**:
   - Ensure the service account has access to the sheet
   - Check if the sheet ID is correct

2. **Bitrix24 Authentication Error**:
   - Verify the webhook URL is correct
   - Check if the webhook has necessary permissions

3. **Sync Not Working**:
   - Check the application logs
   - Verify environment variables
   - Test connections using CLI commands

### Debug Mode
```bash
npm run start:debug
```

## 📝 Data Flow

1. **Read Data**: Application reads data from Google Sheets
2. **Validate Data**: Checks for required fields and data quality
3. **Check Duplicates**: Searches Bitrix24 for existing leads
4. **Create/Update**: Creates new leads or updates existing ones
5. **Update Status**: Updates sync status in Google Sheets
6. **Log Results**: Records detailed logs of the operation

## 🔒 Security

- All sensitive data stored in environment variables
- Service account credentials secured
- API rate limiting implemented
- Input validation and sanitization
- Comprehensive error handling

## 📊 Performance

- **Batch Processing**: Handles multiple records efficiently
- **Rate Limiting**: Respects API quotas
- **Retry Mechanism**: Automatic retry on failures
- **Memory Efficient**: Processes data in chunks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review application logs
- Test connections using CLI commands
- Create an issue in the repository

## 🏗️ Architecture

### System Components
- **NestJS Application**: Main application framework
- **Google Sheets Service**: Handles Google Sheets API integration
- **Bitrix24 Service**: Manages Bitrix24 CRM operations
- **Sync Service**: Core synchronization logic
- **Scheduler Service**: Automated sync scheduling
- **CLI Commands**: Manual operations interface

### Data Flow
```
Google Sheets → Sync Service → Bitrix24 CRM
     ↓              ↓              ↓
  Read Data    Process & Map   Create/Update
     ↓              ↓              ↓
  Update Status ← Log Results ← API Response
```

## 📋 API Reference

### Authentication
All API endpoints require proper configuration in environment variables.

### Request/Response Examples

#### Health Check
```bash
curl http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "Bitrix24 Google Sheets Integration"
}
```

#### Manual Sync
```bash
curl -X POST http://localhost:3000/sync/start
```
Response:
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

#### Sync Statistics
```bash
curl http://localhost:3000/sync/stats
```
Response:
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

## 🔧 Advanced Configuration

### Environment Variables
Complete list of environment variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Sheets Configuration
GOOGLE_CREDENTIALS_TYPE=service_account
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# Google Sheets Details
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SHEET_RANGE=A:Z
GOOGLE_SHEET_HEADER_ROW=1

# Bitrix24 Configuration
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your-webhook-code/
BITRIX24_ACCESS_TOKEN=your-access-token
BITRIX24_DOMAIN=your-domain.bitrix24.com

# Sync Configuration
SYNC_SCHEDULE=*/15 * * * *
SYNC_BATCH_SIZE=10
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=1000
SYNC_DUPLICATE_FIELDS=email,phone

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Field Mapping Configuration
Edit `src/config/mapping.json` to customize field mappings:

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

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start dist/main.js --name bitrix24-sync

# Monitor
pm2 monit

# Stop
pm2 stop bitrix24-sync
```

### 3. Systemd Service (Linux)
Create `/etc/systemd/system/bitrix24-sync.service`:
```ini
[Unit]
Description=Bitrix24 Google Sheets Integration
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/bitrix24-sync
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable bitrix24-sync
sudo systemctl start bitrix24-sync
sudo systemctl status bitrix24-sync
```

## 📊 Monitoring and Alerting

### Health Checks
- **Application Health**: `GET /health`
- **Google Sheets Connection**: `GET /google-sheets/validate`
- **Bitrix24 Connection**: `GET /bitrix24/validate`

### Logging
- **Console Logs**: Real-time status updates
- **File Logs**: Detailed logs in `logs/app.log`
- **Log Levels**: `error`, `warn`, `info`, `debug`

### Metrics
- **Sync Statistics**: Track performance metrics
- **Error Rates**: Monitor failure rates
- **Processing Times**: Performance monitoring

## 🔍 Troubleshooting Guide

### Common Issues and Solutions

#### 1. Google Sheets Permission Error
**Error**: `The caller does not have permission`
**Solution**:
- Ensure service account has access to the sheet
- Check if the sheet ID is correct
- Verify service account email is added to sheet sharing

#### 2. Bitrix24 Authentication Error
**Error**: `401 Unauthorized`
**Solution**:
- Verify webhook URL is correct
- Check webhook permissions
- Ensure webhook is active

#### 3. Sync Not Working
**Symptoms**: No data syncing, empty logs
**Solution**:
- Check environment variables
- Verify sheet has data
- Test connections using CLI commands
- Check application logs

#### 4. High Memory Usage
**Symptoms**: Application crashes, slow performance
**Solution**:
- Reduce batch size in configuration
- Check for memory leaks in logs
- Monitor system resources

### Debug Commands
```bash
# Test Google Sheets connection
npm run validate

# Check sync statistics
npm run stats

# Manual sync with verbose logging
LOG_LEVEL=debug npm run sync
```

### Log Analysis
```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Monitor sync activity
grep "Sync completed" logs/app.log
```

## 📈 Performance Optimization

### Batch Processing
- **Default Batch Size**: 10 records
- **Configurable**: Set `SYNC_BATCH_SIZE` in environment
- **Parallel Processing**: Within each batch

### Rate Limiting
- **Retry Mechanism**: 3 attempts with exponential backoff
- **API Quotas**: Respects Google Sheets and Bitrix24 limits
- **Delay Configuration**: Customizable retry delays

### Memory Management
- **Chunked Processing**: Large datasets processed in chunks
- **Garbage Collection**: Automatic cleanup of processed data
- **Resource Monitoring**: Built-in performance tracking

## 🔒 Security Best Practices

### Environment Variables
- Store all sensitive data in environment variables
- Never commit `.env` files to version control
- Use different configurations for different environments

### API Security
- Use service accounts for Google Sheets
- Implement webhook authentication for Bitrix24
- Validate all input data
- Implement rate limiting

### Network Security
- Use HTTPS for all API communications
- Implement proper firewall rules
- Monitor network traffic

## 📚 Documentation

### Project Documentation
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Configuration Guide](docs/configuration-guide.md) - Detailed configuration options
- [Troubleshooting Guide](docs/troubleshooting-guide.md) - Common issues and solutions
- [Deployment Guide](docs/deployment-guide.md) - Deployment options and instructions
- [Google Sheet Template](docs/google-sheet-template.md) - Required sheet structure

### External Resources
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Bitrix24 REST API Documentation](https://dev.1c-bitrix.ru/rest_help/)
- [NestJS Documentation](https://docs.nestjs.com)

### Community Support
- GitHub Issues: Report bugs and request features
- Stack Overflow: Technical questions
- Discord: Real-time community support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Wiki](https://github.com/your-repo/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)
